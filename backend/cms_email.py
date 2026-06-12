"""SMTP email delivery for CMS notifications."""

from __future__ import annotations

import logging
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from env_loader import load_env

logger = logging.getLogger("fbr-ai")


def _smtp_settings() -> dict[str, str | int | bool]:
    load_env()
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", "").strip(),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "from_email": os.getenv("SMTP_FROM_EMAIL", "").strip(),
        "from_name": os.getenv("SMTP_FROM_NAME", "Free Background Remover AI").strip(),
        "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() in {"1", "true", "yes"},
    }


def smtp_configured() -> bool:
    cfg = _smtp_settings()
    return bool(cfg["host"] and cfg["from_email"])


def send_email(*, to: str, subject: str, html: str, text: str) -> None:
    cfg = _smtp_settings()
    host = str(cfg["host"])
    from_email = str(cfg["from_email"])

    if not host or not from_email:
        raise RuntimeError("SMTP is not configured. Set SMTP_HOST and SMTP_FROM_EMAIL in .env")

    from_name = str(cfg["from_name"])
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{from_name} <{from_email}>" if from_name else from_email
    message["To"] = to
    message.attach(MIMEText(text, "plain", "utf-8"))
    message.attach(MIMEText(html, "html", "utf-8"))

    port = int(cfg["port"])
    use_tls = bool(cfg["use_tls"])
    user = str(cfg["user"])
    password = str(cfg["password"])

    logger.info("Sending email to %s via %s:%s", to, host, port)

    with smtplib.SMTP(host, port, timeout=30) as server:
        if use_tls:
            server.starttls(context=ssl.create_default_context())
        if user and password:
            server.login(user, password)
        server.sendmail(from_email, [to], message.as_string())
