"""Secure admin authentication — passwords, sessions, route guard."""

from __future__ import annotations

import hashlib
import os
import secrets
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta
from fastapi import Cookie, Depends, Header, HTTPException, Request, Response
from sqlalchemy.orm import Session

from cms_database import get_db_dep
from cms_models import AdminSession, AdminUser

SESSION_COOKIE_NAME = "fbg_admin_session"
SESSION_DAYS = int(os.getenv("ADMIN_SESSION_DAYS", "7"))
COOKIE_SECURE = os.getenv("ADMIN_COOKIE_SECURE", "false").lower() in {"1", "true", "yes"}
MAX_LOGIN_ATTEMPTS = int(os.getenv("ADMIN_MAX_LOGIN_ATTEMPTS", "5"))
LOGIN_WINDOW_SECONDS = int(os.getenv("ADMIN_LOGIN_WINDOW_SECONDS", "900"))

# Used to keep login timing constant when email is not found.
_DUMMY_PASSWORD_HASH = (
    "deadbeefdeadbeefdeadbeefdeadbeef$"
    "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e012895e839"
)

_login_attempts: dict[str, deque[float]] = defaultdict(deque)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        260000,
    )
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hex_digest = stored.split("$", 1)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        260000,
    )
    return secrets.compare_digest(digest.hex(), hex_digest)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_session_token() -> str:
    return secrets.token_urlsafe(48)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _check_login_rate_limit(ip: str) -> None:
    now = time.time()
    attempts = _login_attempts[ip]
    while attempts and now - attempts[0] > LOGIN_WINDOW_SECONDS:
        attempts.popleft()
    if len(attempts) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please wait and try again.",
        )


def _record_failed_login(ip: str) -> None:
    _login_attempts[ip].append(time.time())


def _clear_login_attempts(ip: str) -> None:
    _login_attempts.pop(ip, None)


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=SESSION_DAYS * 86400,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/")


def create_admin_session(
    db: Session,
    user: AdminUser,
    *,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> tuple[str, datetime]:
    token = create_session_token()
    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)
    db.add(
        AdminSession(
            user_id=user.id,
            token_hash=hash_session_token(token),
            expires_at=expires_at,
            ip_address=(ip_address or "")[:64] or None,
            user_agent=(user_agent or "")[:255] or None,
        )
    )
    user.last_login = datetime.utcnow()
    db.flush()
    return token, expires_at


def authenticate_credentials(
    db: Session,
    email: str,
    password: str,
    *,
    ip: str,
) -> AdminUser:
    _check_login_rate_limit(ip)

    user = db.query(AdminUser).filter(AdminUser.email == email).first()
    password_ok = bool(
        user and user.is_active and verify_password(password, user.password_hash)
    )
    if not password_ok:
        verify_password(password, _DUMMY_PASSWORD_HASH)
        _record_failed_login(ip)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    _clear_login_attempts(ip)
    return user


def _extract_token(
    session_cookie: str | None,
    authorization: str | None,
) -> str | None:
    if session_cookie:
        return session_cookie.strip()
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        return token or None
    return None


def get_current_admin(
    request: Request,
    db: Session = Depends(get_db_dep),
    session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    authorization: str | None = Header(default=None),
) -> AdminUser:
    token = _extract_token(session_cookie, authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    token_hash = hash_session_token(token)
    session = (
        db.query(AdminSession)
        .filter(
            AdminSession.token_hash == token_hash,
            AdminSession.expires_at > datetime.utcnow(),
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    user = db.query(AdminUser).filter(AdminUser.id == session.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Account inactive or not found.")

    return user


def get_optional_admin(
    session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db_dep),
) -> AdminUser | None:
    token = _extract_token(session_cookie, authorization)
    if not token:
        return None

    token_hash = hash_session_token(token)
    session = (
        db.query(AdminSession)
        .filter(
            AdminSession.token_hash == token_hash,
            AdminSession.expires_at > datetime.utcnow(),
        )
        .first()
    )
    if not session:
        return None

    user = db.query(AdminUser).filter(AdminUser.id == session.user_id).first()
    if not user or not user.is_active:
        return None
    return user


def require_admin_role(admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required.")
    return admin


def revoke_session(
    db: Session,
    *,
    session_cookie: str | None = None,
    authorization: str | None = None,
) -> None:
    token = _extract_token(session_cookie, authorization)
    if not token:
        return
    token_hash = hash_session_token(token)
    db.query(AdminSession).filter(AdminSession.token_hash == token_hash).delete()
