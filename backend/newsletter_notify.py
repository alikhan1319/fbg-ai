"""Send newsletter alerts when a new blog post is published."""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.orm import Session

from cms_email import send_email, smtp_configured
from cms_models import BlogPost, NewsletterSubscriber
from env_loader import load_env

load_env()

logger = logging.getLogger("fbr-ai")


def _site_url() -> str:
    load_env()
    return (os.getenv("SITE_URL") or os.getenv("FRONTEND_URL") or "http://localhost:3000").rstrip("/")


def _site_name() -> str:
    load_env()
    return os.getenv("SITE_NAME", "Free Background Remover AI").strip()


def _notify_enabled() -> bool:
    load_env()
    return os.getenv("NEWSLETTER_NOTIFY_ENABLED", "true").lower() in {"1", "true", "yes"}


@dataclass(frozen=True)
class BlogEmailPayload:
    title: str
    slug: str
    excerpt: str
    category: str
    date: str
    image: str


def payload_from_post(post: BlogPost) -> BlogEmailPayload:
    published = post.published_at or post.created_at
    date_label = published.strftime("%B %d, %Y") if published else datetime.utcnow().strftime("%B %d, %Y")
    return BlogEmailPayload(
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        category=post.category,
        date=date_label,
        image=post.image or "",
    )


def _absolute_image_url(image: str) -> str:
    if not image:
        return ""
    if image.startswith("http://") or image.startswith("https://"):
        return image
    load_env()
    api_base = (os.getenv("PUBLIC_API_URL") or os.getenv("SITE_URL") or "http://localhost:8000").rstrip("/")
    site_url = _site_url()
    if image.startswith("/blog-media/"):
        return f"{api_base}{image}"
    return f"{site_url}{image}" if image.startswith("/") else image


def _build_email(payload: BlogEmailPayload) -> tuple[str, str, str]:
    site_url = _site_url()
    site_name = _site_name()
    article_url = f"{site_url}/blog/{payload.slug}"
    image_url = _absolute_image_url(payload.image)
    subject = f"New on {site_name}: {payload.title}"

    text = (
        f"Hi,\n\n"
        f"We just published a new article on {site_name}:\n\n"
        f"{payload.title}\n"
        f"{payload.excerpt}\n\n"
        f"Read it here: {article_url}\n\n"
        f"You are receiving this because you subscribed to our newsletter.\n"
    )

    image_block = (
        f'<img src="{image_url}" alt="" style="max-width:100%;border-radius:12px;margin:16px 0;" />'
        if image_url
        else ""
    )

    html = f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#6c63ff,#8b5cf6);color:#ffffff;">
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.9;">New blog post</p>
              <h1 style="margin:12px 0 0;font-size:24px;line-height:1.3;">{payload.title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">{payload.category} · {payload.date}</p>
              {image_block}
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">{payload.excerpt}</p>
              <a href="{article_url}" style="display:inline-block;background:#6c63ff;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:bold;">
                Read article
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;font-size:12px;line-height:1.5;color:#9ca3af;border-top:1px solid #eef2f7;">
              You subscribed to updates from {site_name}.<br />
              <a href="{site_url}" style="color:#6c63ff;">Visit website</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    return subject, html, text


def send_blog_newsletter(payload: BlogEmailPayload, recipients: list[str]) -> int:
    """Send newsletter emails synchronously. Returns successful send count."""
    if not recipients:
        return 0

    subject, html, text = _build_email(payload)
    sent = 0
    for email in recipients:
        try:
            send_email(to=email, subject=subject, html=html, text=text)
            sent += 1
        except Exception as exc:
            logger.error("Newsletter email failed for %s: %s", email, exc)
    logger.info("Newsletter sent for '%s' to %s/%s subscribers", payload.slug, sent, len(recipients))
    return sent


def prepare_blog_newsletter(post: BlogPost, db: Session) -> tuple[BlogEmailPayload, list[str]] | None:
    """Validate settings and collect recipients. Returns None when notify should be skipped."""
    if not _notify_enabled():
        logger.info("Newsletter notify disabled (NEWSLETTER_NOTIFY_ENABLED=false)")
        return None

    if not smtp_configured():
        logger.warning("Newsletter notify skipped: configure SMTP_HOST and SMTP_FROM_EMAIL in .env")
        return None

    recipients = [row[0] for row in db.query(NewsletterSubscriber.email).all()]
    if not recipients:
        logger.info("Newsletter notify skipped: no subscribers")
        return None

    return payload_from_post(post), recipients


def notify_subscribers_new_blog(post: BlogPost, db: Session) -> int:
    """Returns subscriber count when a newsletter send is scheduled."""
    prepared = prepare_blog_newsletter(post, db)
    if not prepared:
        return 0
    _, recipients = prepared
    return len(recipients)
