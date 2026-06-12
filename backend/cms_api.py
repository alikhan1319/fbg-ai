"""CMS API routes — blog, newsletter, analytics, admin dashboard."""

from __future__ import annotations

import csv
import io
import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, File, Header, HTTPException, Query, Request, Response, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from cms_auth import (
    SESSION_COOKIE_NAME,
    authenticate_credentials,
    clear_session_cookie,
    create_admin_session,
    get_current_admin,
    get_optional_admin,
    hash_password,
    require_admin_role,
    revoke_session,
    set_session_cookie,
)
from cms_database import get_db, get_db_dep
from newsletter_notify import prepare_blog_newsletter, send_blog_newsletter
from cms_models import (
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
from cms_schemas import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminUserCreate,
    AdminUserPublic,
    BlogArticlePublic,
    BlogListResponse,
    BlogPostCreate,
    BlogPostPublic,
    BlogPostUpdate,
    BlogSectionSchema,
    DashboardResponse,
    NewsletterSubscribe,
    NewsletterSubscriberOut,
    PageViewTrack,
    SiteFaqCreate,
    SiteFaqPublic,
    SiteFaqUpdate,
    SiteLegalHighlightSchema,
    SiteLegalPagePublic,
    SiteLegalPageUpdate,
    SiteLegalSectionSchema,
    SiteTestimonialCreate,
    SiteTestimonialPublic,
    SiteTestimonialUpdate,
    ToolUsageTrack,
)

cms_router = APIRouter(prefix="/api", tags=["cms"])

BASE_DIR = Path(__file__).resolve().parent
BLOG_MEDIA_DIR = BASE_DIR / "blog_media"
BLOG_MEDIA_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_BLOG_MEDIA = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BLOG_MEDIA_BYTES = 5 * 1024 * 1024

BLOG_PAGE_SIZE = 12
DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

TOOL_ROUTES = [
    {"id": "remove-bg", "name": "Background Remover", "route": "/remove-bg"},
    {"id": "upscale", "name": "Image Upscaler", "route": "/upscale"},
    {"id": "gen-bg", "name": "Generate Background", "route": "/generate-background"},
    {"id": "watermark", "name": "Watermark Remover", "route": "/remove-watermark"},
    {"id": "blur-bg", "name": "Background Blur", "route": "/blur-background"},
    {"id": "enhance", "name": "Image Enhancer", "route": "/enhance-image"},
]


def _format_date(dt: datetime | None) -> str:
    if not dt:
        return datetime.utcnow().strftime("%B %d, %Y")
    return dt.strftime("%B %d, %Y")


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "post"


def _post_to_public(post: BlogPost) -> BlogPostPublic:
    return BlogPostPublic(
        id=post.id,
        title=post.title,
        slug=post.slug,
        excerpt=post.excerpt,
        date=_format_date(post.published_at or post.created_at),
        category=post.category,
        readTime=post.read_time,
        toolLink=post.tool_link,
        image=post.image,
        imageAlt=post.image_alt,
        status=post.status,
        viewCount=post.view_count,
    )


def _post_to_article(post: BlogPost) -> BlogArticlePublic:
    sections = [
        BlogSectionSchema(
            heading=s.get("heading"),
            paragraphs=s.get("paragraphs") or [],
        )
        for s in (post.sections or [])
    ]
    return BlogArticlePublic(
        **_post_to_public(post).model_dump(),
        sections=sections,
        contentHtml=post.content_html or "",
    )


def _schedule_blog_newsletter(
    post: BlogPost,
    db: Session,
    background_tasks: BackgroundTasks,
) -> int:
    prepared = prepare_blog_newsletter(post, db)
    if not prepared:
        return 0
    payload, recipients = prepared
    background_tasks.add_task(send_blog_newsletter, payload, recipients)
    return len(recipients)


def _relative_time(dt: datetime) -> str:
    delta = datetime.utcnow() - dt.replace(tzinfo=None) if dt.tzinfo else datetime.utcnow() - dt
    minutes = int(delta.total_seconds() // 60)
    if minutes < 60:
        return f"{max(minutes, 1)} min ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    days = hours // 24
    if days == 1:
        return "Yesterday"
    return f"{days} days ago"


# ---------------------------------------------------------------------------
# Public blog
# ---------------------------------------------------------------------------
@cms_router.get("/blog", response_model=BlogListResponse)
def list_blog_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(BLOG_PAGE_SIZE, ge=1, le=50),
    db: Session = Depends(get_db_dep),
) -> BlogListResponse:
    query = db.query(BlogPost).filter(BlogPost.status == "published")
    total = query.count()
    total_pages = max(1, (total + limit - 1) // limit)
    safe_page = min(page, total_pages)
    posts = (
        query.order_by(BlogPost.published_at.desc(), BlogPost.id.desc())
        .offset((safe_page - 1) * limit)
        .limit(limit)
        .all()
    )
    return BlogListResponse(
        page=safe_page,
        totalPages=total_pages,
        totalPosts=total,
        posts=[_post_to_public(p) for p in posts],
    )


@cms_router.get("/blog/slugs")
def list_blog_slugs(db: Session = Depends(get_db_dep)) -> dict[str, list[str]]:
    slugs = [
        row.slug
        for row in db.query(BlogPost.slug)
        .filter(BlogPost.status == "published")
        .order_by(BlogPost.published_at.desc())
        .all()
    ]
    return {"slugs": slugs}


@cms_router.get("/blog/{slug}", response_model=BlogArticlePublic)
def get_blog_post(slug: str, db: Session = Depends(get_db_dep)) -> BlogArticlePublic:
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.status == "published").first()
    if not post:
        raise HTTPException(status_code=404, detail="Article not found")

    post.view_count += 1
    db.add(AnalyticsBlogView(post_id=post.id))
    db.flush()

    return _post_to_article(post)


@cms_router.get("/blog/{slug}/related", response_model=list[BlogPostPublic])
def get_related_posts(
    slug: str,
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db_dep),
) -> list[BlogPostPublic]:
    current = db.query(BlogPost).filter(BlogPost.slug == slug).first()
    if not current:
        return []

    same = (
        db.query(BlogPost)
        .filter(
            BlogPost.slug != slug,
            BlogPost.status == "published",
            BlogPost.category == current.category,
        )
        .order_by(BlogPost.published_at.desc())
        .all()
    )
    others = (
        db.query(BlogPost)
        .filter(
            BlogPost.slug != slug,
            BlogPost.status == "published",
            BlogPost.category != current.category,
        )
        .order_by(BlogPost.published_at.desc())
        .all()
    )
    combined = same + others
    return [_post_to_public(p) for p in combined[:limit]]


# ---------------------------------------------------------------------------
# Newsletter
# ---------------------------------------------------------------------------
@cms_router.post("/newsletter/subscribe")
def subscribe_newsletter(body: NewsletterSubscribe, db: Session = Depends(get_db_dep)) -> dict[str, str]:
    email = body.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    if existing:
        return {"message": "Already subscribed", "status": "exists"}

    db.add(NewsletterSubscriber(email=email, source=body.source or "Footer"))
    db.flush()
    return {"message": "Subscribed successfully", "status": "ok"}


# ---------------------------------------------------------------------------
# Analytics tracking
# ---------------------------------------------------------------------------
@cms_router.post("/analytics/page-view")
def track_page_view(body: PageViewTrack, db: Session = Depends(get_db_dep)) -> dict[str, str]:
    db.add(AnalyticsPageView(path=body.path[:500]))
    return {"status": "ok"}


@cms_router.post("/analytics/tool-usage")
def track_tool_usage(body: ToolUsageTrack, db: Session = Depends(get_db_dep)) -> dict[str, str]:
    db.add(
        AnalyticsToolUsage(
            tool_id=body.tool_id[:100],
            tool_name=body.tool_name[:255],
        )
    )
    return {"status": "ok"}


def log_tool_usage(db: Session, tool_id: str, tool_name: str) -> None:
    db.add(AnalyticsToolUsage(tool_id=tool_id, tool_name=tool_name))


def _user_to_public(user: AdminUser) -> AdminUserPublic:
    return AdminUserPublic(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        isActive=user.is_active,
        createdAt=_format_date(user.created_at),
    )


# ---------------------------------------------------------------------------
# Admin auth
# ---------------------------------------------------------------------------
@cms_router.post("/admin/auth/login", response_model=AdminLoginResponse)
def admin_login(
    body: AdminLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db_dep),
) -> AdminLoginResponse:
    email = body.email.strip().lower()
    user = authenticate_credentials(db, email, body.password, ip=_client_ip(request))
    token, expires_at = create_admin_session(
        db,
        user,
        ip_address=_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )
    set_session_cookie(response, token)
    return AdminLoginResponse(user=_user_to_public(user), expiresAt=expires_at.strftime("%Y-%m-%dT%H:%M:%SZ"))


@cms_router.post("/admin/auth/logout")
def admin_logout(
    response: Response,
    db: Session = Depends(get_db_dep),
    session_cookie: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    authorization: str | None = Header(default=None),
) -> dict[str, str]:
    revoke_session(db, session_cookie=session_cookie, authorization=authorization)
    clear_session_cookie(response)
    return {"status": "ok"}


@cms_router.get("/admin/auth/me", response_model=AdminUserPublic)
def admin_me(admin: AdminUser = Depends(get_current_admin)) -> AdminUserPublic:
    return _user_to_public(admin)


@cms_router.get("/admin/auth/bootstrap")
def admin_bootstrap_status(db: Session = Depends(get_db_dep)) -> dict[str, bool]:
    """Public — tells the login UI whether first-user setup is required."""
    needs_bootstrap = db.query(AdminUser).count() == 0
    return {"needsBootstrap": needs_bootstrap}


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


# ---------------------------------------------------------------------------
# Admin users (admin role only; bootstrap when no users exist)
# ---------------------------------------------------------------------------
@cms_router.get("/admin/users", response_model=list[AdminUserPublic])
def admin_list_users(
    db: Session = Depends(get_db_dep),
    admin: AdminUser | None = Depends(get_optional_admin),
) -> list[AdminUserPublic]:
    user_count = db.query(AdminUser).count()
    if user_count > 0 and (not admin or admin.role != "admin"):
        raise HTTPException(status_code=403, detail="Admin role required.")
    users = db.query(AdminUser).order_by(AdminUser.created_at.desc()).all()
    return [_user_to_public(user) for user in users]


@cms_router.post("/admin/users", response_model=AdminUserPublic)
def admin_create_user(
    body: AdminUserCreate,
    db: Session = Depends(get_db_dep),
    admin: AdminUser | None = Depends(get_optional_admin),
) -> AdminUserPublic:
    user_count = db.query(AdminUser).count()
    if user_count > 0:
        if not admin or admin.role != "admin":
            raise HTTPException(status_code=403, detail="Admin role required to create users.")

    email = body.email.strip().lower()
    if db.query(AdminUser).filter(AdminUser.email == email).first():
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    user = AdminUser(
        email=email,
        password_hash=hash_password(body.password),
        name=body.name.strip(),
        role=(body.role or "admin").strip() or "admin",
        is_active=True,
    )
    db.add(user)
    db.flush()
    return _user_to_public(user)


@cms_router.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db_dep),
    admin: AdminUser = Depends(require_admin_role),
) -> dict[str, str]:
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account while logged in.")
    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Admin dashboard
# ---------------------------------------------------------------------------
@cms_router.get("/admin/dashboard", response_model=DashboardResponse)
def admin_dashboard(
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> DashboardResponse:
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    prev_week_start = now - timedelta(days=14)

    total_visits = db.query(AnalyticsPageView).count()
    week_visits = db.query(AnalyticsPageView).filter(AnalyticsPageView.created_at >= week_ago).count()
    prev_visits = (
        db.query(AnalyticsPageView)
        .filter(AnalyticsPageView.created_at >= prev_week_start, AnalyticsPageView.created_at < week_ago)
        .count()
    )

    total_tools = db.query(AnalyticsToolUsage).count()
    week_tools = db.query(AnalyticsToolUsage).filter(AnalyticsToolUsage.created_at >= week_ago).count()
    prev_tools = (
        db.query(AnalyticsToolUsage)
        .filter(AnalyticsToolUsage.created_at >= prev_week_start, AnalyticsToolUsage.created_at < week_ago)
        .count()
    )

    total_blog_views = db.query(AnalyticsBlogView).count()
    week_blog = db.query(AnalyticsBlogView).filter(AnalyticsBlogView.created_at >= week_ago).count()
    prev_blog = (
        db.query(AnalyticsBlogView)
        .filter(AnalyticsBlogView.created_at >= prev_week_start, AnalyticsBlogView.created_at < week_ago)
        .count()
    )

    total_subs = db.query(NewsletterSubscriber).count()
    week_subs = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.created_at >= week_ago).count()

    def pct_change(current: int, previous: int) -> tuple[str, str]:
        if previous == 0:
            return (f"+{current}" if current else "0", "up" if current else "neutral")
        change = ((current - previous) / previous) * 100
        trend = "up" if change >= 0 else "down"
        return (f"{change:+.1f}%", trend)

    visits_change, visits_trend = pct_change(week_visits, prev_visits)
    tools_change, tools_trend = pct_change(week_tools, prev_tools)
    blog_change, blog_trend = pct_change(week_blog, prev_blog)

    weekly_metrics = []
    max_visits = 1
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        visits = (
            db.query(AnalyticsPageView)
            .filter(AnalyticsPageView.created_at >= day_start, AnalyticsPageView.created_at < day_end)
            .count()
        )
        tool_uses = (
            db.query(AnalyticsToolUsage)
            .filter(AnalyticsToolUsage.created_at >= day_start, AnalyticsToolUsage.created_at < day_end)
            .count()
        )
        max_visits = max(max_visits, visits)
        weekly_metrics.append(
            {
                "day": DAY_LABELS[day_start.weekday()],
                "visits": visits,
                "toolUses": tool_uses,
            }
        )

    tool_usage_rows = []
    tool_counts = (
        db.query(AnalyticsToolUsage.tool_id, AnalyticsToolUsage.tool_name, func.count(AnalyticsToolUsage.id))
        .group_by(AnalyticsToolUsage.tool_id, AnalyticsToolUsage.tool_name)
        .all()
    )
    tool_map = {row[0]: {"name": row[1], "sessions": row[2]} for row in tool_counts}
    total_sessions = sum(v["sessions"] for v in tool_map.values()) or 1

    for tool in TOOL_ROUTES:
        data = tool_map.get(tool["id"], {"name": tool["name"], "sessions": 0})
        sessions = data["sessions"]
        tool_usage_rows.append(
            {
                "id": tool["id"],
                "name": data["name"] or tool["name"],
                "route": tool["route"],
                "sessions": sessions,
                "share": round((sessions / total_sessions) * 100) if sessions else 0,
            }
        )

    tool_usage_rows.sort(key=lambda row: row["sessions"], reverse=True)

    categories = (
        db.query(BlogPost.category, func.count(BlogPost.id))
        .filter(BlogPost.status == "published")
        .group_by(BlogPost.category)
        .order_by(func.count(BlogPost.id).desc())
        .all()
    )

    total_posts = db.query(BlogPost).filter(BlogPost.status == "published").count()
    latest = (
        db.query(BlogPost)
        .filter(BlogPost.status == "published")
        .order_by(BlogPost.published_at.desc(), BlogPost.id.desc())
        .limit(3)
        .all()
    )

    recent_activity: list[dict[str, Any]] = []

    recent_posts = db.query(BlogPost).order_by(BlogPost.updated_at.desc()).limit(2).all()
    for post in recent_posts:
        recent_activity.append(
            {
                "id": f"blog-{post.id}",
                "action": "Blog updated" if post.updated_at != post.created_at else "Blog published",
                "detail": post.title,
                "time": _relative_time(post.updated_at),
                "type": "blog",
            }
        )

    recent_tools = db.query(AnalyticsToolUsage).order_by(AnalyticsToolUsage.created_at.desc()).limit(2).all()
    for row in recent_tools:
        recent_activity.append(
            {
                "id": f"tool-{row.id}",
                "action": "Tool used",
                "detail": f"{row.tool_name} session",
                "time": _relative_time(row.created_at),
                "type": "tool",
            }
        )

    recent_subs = db.query(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()).limit(2).all()
    for sub in recent_subs:
        recent_activity.append(
            {
                "id": f"sub-{sub.id}",
                "action": "New subscriber",
                "detail": sub.email,
                "time": _relative_time(sub.created_at),
                "type": "newsletter",
            }
        )

    recent_activity.sort(key=lambda x: 0)
    recent_activity = recent_activity[:5]

    return DashboardResponse(
        stats=[
            {"label": "Total visits", "value": f"{total_visits:,}", "change": visits_change, "trend": visits_trend},
            {"label": "Tool sessions", "value": f"{total_tools:,}", "change": tools_change, "trend": tools_trend},
            {"label": "Blog views", "value": f"{total_blog_views:,}", "change": blog_change, "trend": blog_trend},
            {"label": "Newsletter subs", "value": f"{total_subs:,}", "change": f"+{week_subs}", "trend": "up"},
        ],
        weeklyMetrics=weekly_metrics,
        maxVisits=max_visits,
        toolUsage=tool_usage_rows,
        totalToolSessions=sum(row["sessions"] for row in tool_usage_rows),
        recentActivity=recent_activity,
        blogCategories=[{"category": c, "count": n} for c, n in categories],
        totalPosts=total_posts,
        totalTools=len(TOOL_ROUTES),
        latestPosts=[_post_to_public(p) for p in latest],
    )


# ---------------------------------------------------------------------------
# Admin blog CRUD
# ---------------------------------------------------------------------------
@cms_router.get("/admin/blog/categories/list")
def admin_blog_categories(
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> dict[str, list[str]]:
    rows = db.query(BlogPost.category).distinct().order_by(BlogPost.category).all()
    return {"categories": [r[0] for r in rows if r[0]]}


@cms_router.post("/admin/media/upload")
async def admin_upload_blog_image(
    file: UploadFile = File(...),
    _admin: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if not content_type or content_type == "application/octet-stream":
        ext_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
        }
        suffix = Path(file.filename or "").suffix.lower()
        content_type = ext_map.get(suffix, "")

    if content_type not in ALLOWED_BLOG_MEDIA:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP, and GIF images are allowed.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(raw) > MAX_BLOG_MEDIA_BYTES:
        raise HTTPException(status_code=400, detail="Image exceeds 5 MB limit.")

    ext = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" }.get(
        content_type, ".jpg"
    )
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = BLOG_MEDIA_DIR / filename
    dest.write_bytes(raw)
    return {"url": f"/blog-media/{filename}"}


@cms_router.get("/admin/blog", response_model=list[BlogPostPublic])
def admin_list_blog(
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> list[BlogPostPublic]:
    posts = db.query(BlogPost).order_by(BlogPost.published_at.desc(), BlogPost.id.desc()).all()
    return [_post_to_public(p) for p in posts]


@cms_router.get("/admin/blog/{post_id}", response_model=BlogArticlePublic)
def admin_get_blog(
    post_id: int,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> BlogArticlePublic:
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _post_to_article(post)


@cms_router.post("/admin/blog", response_model=BlogArticlePublic)
def admin_create_blog(
    body: BlogPostCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> BlogArticlePublic:
    slug = _slugify(body.slug or body.title)
    if db.query(BlogPost).filter(BlogPost.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")

    sections = [s.model_dump() for s in body.sections] if body.sections else []
    post = BlogPost(
        title=body.title,
        slug=slug,
        excerpt=body.excerpt,
        category=body.category,
        read_time=body.read_time,
        tool_link=body.tool_link,
        image=body.image,
        image_alt=body.image_alt or body.title,
        status=body.status,
        sections=sections,
        content_html=body.content_html or None,
        published_at=datetime.utcnow() if body.status == "published" else None,
    )
    db.add(post)
    db.flush()
    article = _post_to_article(post)
    if post.status == "published":
        article.newsletterSent = _schedule_blog_newsletter(post, db, background_tasks)
    return article


@cms_router.put("/admin/blog/{post_id}", response_model=BlogArticlePublic)
def admin_update_blog(
    post_id: int,
    body: BlogPostUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> BlogArticlePublic:
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    was_published = post.status == "published"

    if body.title is not None:
        post.title = body.title
    if body.slug is not None:
        slug = _slugify(body.slug)
        clash = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.id != post_id).first()
        if clash:
            raise HTTPException(status_code=400, detail="Slug already exists")
        post.slug = slug
    if body.excerpt is not None:
        post.excerpt = body.excerpt
    if body.category is not None:
        post.category = body.category
    if body.read_time is not None:
        post.read_time = body.read_time
    if body.tool_link is not None:
        post.tool_link = body.tool_link
    if body.image is not None:
        post.image = body.image
    if body.image_alt is not None:
        post.image_alt = body.image_alt
    if body.status is not None:
        post.status = body.status
        if body.status == "published" and not post.published_at:
            post.published_at = datetime.utcnow()
    if body.sections is not None:
        post.sections = [s.model_dump() for s in body.sections]
    if body.content_html is not None:
        post.content_html = body.content_html

    post.updated_at = datetime.utcnow()
    db.flush()
    article = _post_to_article(post)
    if not was_published and post.status == "published":
        article.newsletterSent = _schedule_blog_newsletter(post, db, background_tasks)
    return article


@cms_router.delete("/admin/blog/{post_id}")
def admin_delete_blog(
    post_id: int,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    slug = post.slug
    db.query(AnalyticsBlogView).filter(AnalyticsBlogView.post_id == post_id).delete(
        synchronize_session=False
    )
    db.delete(post)
    db.flush()

    return {"status": "deleted", "slug": slug}


# ---------------------------------------------------------------------------
# Admin newsletter
# ---------------------------------------------------------------------------
@cms_router.get("/admin/newsletter", response_model=list[NewsletterSubscriberOut])
def admin_list_newsletter(
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> list[NewsletterSubscriberOut]:
    rows = db.query(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()).all()
    return [
        NewsletterSubscriberOut(
            id=r.id,
            email=r.email,
            source=r.source,
            date=_format_date(r.created_at),
        )
        for r in rows
    ]


@cms_router.delete("/admin/newsletter/{subscriber_id}")
def admin_delete_newsletter(
    subscriber_id: int,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    row = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.id == subscriber_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    db.delete(row)
    return {"status": "deleted"}


@cms_router.get("/admin/newsletter/export")
def admin_export_newsletter(
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> StreamingResponse:
    rows = db.query(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Email", "Source", "Date"])
    for row in rows:
        writer.writerow([row.email, row.source, _format_date(row.created_at)])

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=newsletter-subscribers.csv"},
    )


# ---------------------------------------------------------------------------
# Site content helpers
# ---------------------------------------------------------------------------
def _faq_to_public(row: SiteFaqItem) -> SiteFaqPublic:
    return SiteFaqPublic(
        id=row.id,
        question=row.question,
        answer=row.answer,
        sortOrder=row.sort_order,
        isActive=row.is_active,
    )


def _testimonial_to_public(row: SiteTestimonial) -> SiteTestimonialPublic:
    return SiteTestimonialPublic(
        id=row.id,
        name=row.name,
        role=row.role,
        company=row.company,
        quote=row.quote,
        avatar=_testimonial_avatar_from_name(row.name),
        sortOrder=row.sort_order,
        isActive=row.is_active,
    )


def _testimonial_avatar_from_name(name: str) -> str:
    for ch in name.strip():
        if ch.isalpha():
            return ch.upper()
    trimmed = name.strip()
    return trimmed[:1].upper() if trimmed else "A"


def _next_testimonial_sort_order(db: Session) -> int:
    current_max = db.query(func.max(SiteTestimonial.sort_order)).scalar()
    return (current_max if current_max is not None else -1) + 1


def _legal_to_public(page: SiteLegalPage) -> SiteLegalPagePublic:
    return SiteLegalPagePublic(
        slug=page.slug,
        pageTitle=page.page_title,
        lastUpdated=page.last_updated,
        highlights=[SiteLegalHighlightSchema(**h) for h in (page.highlights or [])],
        sections=[SiteLegalSectionSchema(**s) for s in (page.sections or [])],
    )


# ---------------------------------------------------------------------------
# Public site content
# ---------------------------------------------------------------------------
@cms_router.get("/site/faq", response_model=list[SiteFaqPublic])
def public_site_faq(db: Session = Depends(get_db_dep)) -> list[SiteFaqPublic]:
    rows = (
        db.query(SiteFaqItem)
        .filter(SiteFaqItem.is_active.is_(True))
        .order_by(SiteFaqItem.sort_order.asc(), SiteFaqItem.id.asc())
        .all()
    )
    return [_faq_to_public(row) for row in rows]


@cms_router.get("/site/testimonials", response_model=list[SiteTestimonialPublic])
def public_site_testimonials(db: Session = Depends(get_db_dep)) -> list[SiteTestimonialPublic]:
    rows = (
        db.query(SiteTestimonial)
        .filter(SiteTestimonial.is_active.is_(True))
        .order_by(SiteTestimonial.sort_order.asc(), SiteTestimonial.id.asc())
        .all()
    )
    return [_testimonial_to_public(row) for row in rows]


@cms_router.get("/site/legal/{slug}", response_model=SiteLegalPagePublic)
def public_site_legal(slug: str, db: Session = Depends(get_db_dep)) -> SiteLegalPagePublic:
    page = db.query(SiteLegalPage).filter(SiteLegalPage.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Legal page not found")
    return _legal_to_public(page)


# ---------------------------------------------------------------------------
# Admin site content — FAQ
# ---------------------------------------------------------------------------
@cms_router.get("/admin/site/faq", response_model=list[SiteFaqPublic])
def admin_list_faq(
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> list[SiteFaqPublic]:
    rows = db.query(SiteFaqItem).order_by(SiteFaqItem.sort_order.asc(), SiteFaqItem.id.asc()).all()
    return [_faq_to_public(row) for row in rows]


@cms_router.post("/admin/site/faq", response_model=SiteFaqPublic)
def admin_create_faq(
    body: SiteFaqCreate,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteFaqPublic:
    row = SiteFaqItem(
        question=body.question.strip(),
        answer=body.answer.strip(),
        sort_order=body.sortOrder,
        is_active=body.isActive,
    )
    db.add(row)
    db.flush()
    return _faq_to_public(row)


@cms_router.put("/admin/site/faq/{item_id}", response_model=SiteFaqPublic)
def admin_update_faq(
    item_id: int,
    body: SiteFaqUpdate,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteFaqPublic:
    row = db.query(SiteFaqItem).filter(SiteFaqItem.id == item_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="FAQ item not found")
    if body.question is not None:
        row.question = body.question.strip()
    if body.answer is not None:
        row.answer = body.answer.strip()
    if body.sortOrder is not None:
        row.sort_order = body.sortOrder
    if body.isActive is not None:
        row.is_active = body.isActive
    row.updated_at = datetime.utcnow()
    db.flush()
    return _faq_to_public(row)


@cms_router.delete("/admin/site/faq/{item_id}")
def admin_delete_faq(
    item_id: int,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    row = db.query(SiteFaqItem).filter(SiteFaqItem.id == item_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="FAQ item not found")
    db.delete(row)
    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Admin site content — testimonials
# ---------------------------------------------------------------------------
@cms_router.get("/admin/site/testimonials", response_model=list[SiteTestimonialPublic])
def admin_list_testimonials(
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> list[SiteTestimonialPublic]:
    rows = (
        db.query(SiteTestimonial)
        .order_by(SiteTestimonial.sort_order.asc(), SiteTestimonial.id.asc())
        .all()
    )
    return [_testimonial_to_public(row) for row in rows]


@cms_router.post("/admin/site/testimonials", response_model=SiteTestimonialPublic)
def admin_create_testimonial(
    body: SiteTestimonialCreate,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteTestimonialPublic:
    row = SiteTestimonial(
        name=body.name.strip(),
        role=(body.role or "").strip(),
        company=(body.company or "").strip(),
        quote=body.quote.strip(),
        avatar=_testimonial_avatar_from_name(body.name),
        sort_order=_next_testimonial_sort_order(db),
        is_active=body.isActive,
    )
    db.add(row)
    db.flush()
    return _testimonial_to_public(row)


@cms_router.put("/admin/site/testimonials/{item_id}", response_model=SiteTestimonialPublic)
def admin_update_testimonial(
    item_id: int,
    body: SiteTestimonialUpdate,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteTestimonialPublic:
    row = db.query(SiteTestimonial).filter(SiteTestimonial.id == item_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    if body.name is not None:
        row.name = body.name.strip()
        row.avatar = _testimonial_avatar_from_name(row.name)
    if body.role is not None:
        row.role = body.role.strip()
    if body.company is not None:
        row.company = body.company.strip()
    if body.quote is not None:
        row.quote = body.quote.strip()
    if body.isActive is not None:
        row.is_active = body.isActive
    row.updated_at = datetime.utcnow()
    db.flush()
    return _testimonial_to_public(row)


@cms_router.delete("/admin/site/testimonials/{item_id}")
def admin_delete_testimonial(
    item_id: int,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    row = db.query(SiteTestimonial).filter(SiteTestimonial.id == item_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(row)
    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Admin site content — legal pages
# ---------------------------------------------------------------------------
@cms_router.get("/admin/site/legal/{slug}", response_model=SiteLegalPagePublic)
def admin_get_legal(
    slug: str,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteLegalPagePublic:
    page = db.query(SiteLegalPage).filter(SiteLegalPage.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Legal page not found")
    return _legal_to_public(page)


@cms_router.put("/admin/site/legal/{slug}", response_model=SiteLegalPagePublic)
def admin_update_legal(
    slug: str,
    body: SiteLegalPageUpdate,
    db: Session = Depends(get_db_dep),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteLegalPagePublic:
    page = db.query(SiteLegalPage).filter(SiteLegalPage.slug == slug).first()
    if not page:
        raise HTTPException(status_code=404, detail="Legal page not found")
    if body.pageTitle is not None:
        page.page_title = body.pageTitle.strip()
    if body.lastUpdated is not None:
        page.last_updated = body.lastUpdated.strip()
    if body.highlights is not None:
        page.highlights = [h.model_dump() for h in body.highlights]
    if body.sections is not None:
        page.sections = [s.model_dump() for s in body.sections]
    page.updated_at = datetime.utcnow()
    db.flush()
    return _legal_to_public(page)
