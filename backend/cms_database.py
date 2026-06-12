"""MySQL database setup for CMS (blog, newsletter, analytics)."""

from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from env_loader import load_env

load_env()

logger = logging.getLogger("fbr-ai")

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "fbgai")


class Base(DeclarativeBase):
    pass


def _admin_url() -> str:
    pwd = MYSQL_PASSWORD
    auth = f"{MYSQL_USER}:{pwd}" if pwd else f"{MYSQL_USER}:"
    return f"mysql+pymysql://{auth}@{MYSQL_HOST}:{MYSQL_PORT}/?charset=utf8mb4"


def _db_url() -> str:
    pwd = MYSQL_PASSWORD
    auth = f"{MYSQL_USER}:{pwd}" if pwd else f"{MYSQL_USER}:"
    return f"mysql+pymysql://{auth}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"


engine = create_engine(
    _db_url(),
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def ensure_database_exists() -> None:
    admin_engine = create_engine(_admin_url(), pool_pre_ping=True)
    with admin_engine.connect() as conn:
        conn.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )
        conn.commit()
    admin_engine.dispose()


@contextmanager
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db_dep() -> Generator[Session, None, None]:
    """Single FastAPI dependency — use this for all CMS routes (one session per request)."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def _migrate_schema() -> None:
    """Add new columns/tables to existing databases without dropping data."""
    from sqlalchemy import inspect

    from cms_models import AdminSession, AdminUser

    insp = inspect(engine)

    if not insp.has_table("admin_users"):
        AdminUser.__table__.create(bind=engine, checkfirst=True)
        logger.info("Created admin_users table")

    if not insp.has_table("admin_sessions"):
        AdminSession.__table__.create(bind=engine, checkfirst=True)
        logger.info("Created admin_sessions table")

    from cms_models import SiteFaqItem, SiteLegalPage, SiteTestimonial

    for model, name in (
        (SiteFaqItem, "site_faq_items"),
        (SiteTestimonial, "site_testimonials"),
        (SiteLegalPage, "site_legal_pages"),
    ):
        if not insp.has_table(name):
            model.__table__.create(bind=engine, checkfirst=True)
            logger.info("Created %s table", name)

    if not insp.has_table("blog_posts"):
        return
    cols = {c["name"] for c in insp.get_columns("blog_posts")}
    if "content_html" not in cols:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE blog_posts ADD COLUMN content_html LONGTEXT NULL"))
            conn.commit()
        logger.info("Added blog_posts.content_html column")


def init_db() -> None:
    ensure_database_exists()
    from cms_models import (  # noqa: WPS433 — local import avoids circular deps
        AdminSession,
        AdminUser,
        AnalyticsBlogView,
        AnalyticsPageView,
        AnalyticsToolUsage,
        BlogPost,
        NewsletterSubscriber,
        SiteFaqItem,
        SiteLegalPage,
        SiteTestimonial,
    )

    Base.metadata.create_all(bind=engine)
    _migrate_schema()
    logger.info("CMS database ready: %s@%s/%s", MYSQL_USER, MYSQL_HOST, MYSQL_DATABASE)

    from cms_seed import seed_if_empty
    from cms_site_seed import seed_site_content_if_empty

    with get_db() as db:
        seed_if_empty(db)
        seed_site_content_if_empty(db)
        _bootstrap_admin_from_env(db)


def _bootstrap_admin_from_env(db: Session) -> None:
    """Create first admin from .env when database has no users."""
    import os

    from cms_auth import hash_password
    from cms_models import AdminUser

    if db.query(AdminUser).count() > 0:
        return

    email = (os.getenv("ADMIN_BOOTSTRAP_EMAIL") or "").strip().lower()
    password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD") or ""
    name = (os.getenv("ADMIN_BOOTSTRAP_NAME") or "Admin").strip() or "Admin"
    if not email or len(password) < 6:
        return

    db.add(
        AdminUser(
            email=email,
            password_hash=hash_password(password),
            name=name,
            role="admin",
            is_active=True,
        )
    )
    db.flush()
    logger.info("Bootstrap admin created: %s", email)
