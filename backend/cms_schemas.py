"""Pydantic schemas for CMS API."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class BlogSectionSchema(BaseModel):
    heading: str | None = None
    paragraphs: list[str] = Field(default_factory=list)


class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    category: str = "Guides"
    read_time: str = "5 min read"
    tool_link: str = "/remove-bg"
    image: str
    image_alt: str = ""
    status: str = "published"
    sections: list[BlogSectionSchema] = Field(default_factory=list)
    content_html: str = ""


class BlogPostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    excerpt: str | None = None
    category: str | None = None
    read_time: str | None = None
    tool_link: str | None = None
    image: str | None = None
    image_alt: str | None = None
    status: str | None = None
    sections: list[BlogSectionSchema] | None = None
    content_html: str | None = None


class BlogPostPublic(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str
    date: str
    category: str
    readTime: str
    toolLink: str
    image: str
    imageAlt: str
    status: str
    viewCount: int = 0


class BlogArticlePublic(BlogPostPublic):
    sections: list[BlogSectionSchema]
    contentHtml: str = ""
    newsletterSent: int | None = None


class BlogListResponse(BaseModel):
    page: int
    totalPages: int
    totalPosts: int
    posts: list[BlogPostPublic]


class NewsletterSubscribe(BaseModel):
    email: EmailStr
    source: str = "Footer"


class NewsletterSubscriberOut(BaseModel):
    id: int
    email: str
    source: str
    date: str


class PageViewTrack(BaseModel):
    path: str = "/"


class ToolUsageTrack(BaseModel):
    tool_id: str
    tool_name: str


class DashboardStat(BaseModel):
    label: str
    value: str
    change: str
    trend: str


class WeeklyMetric(BaseModel):
    day: str
    visits: int
    toolUses: int


class ToolUsageRow(BaseModel):
    id: str
    name: str
    route: str
    sessions: int
    share: int


class ActivityItem(BaseModel):
    id: str
    action: str
    detail: str
    time: str
    type: str


class CategoryStat(BaseModel):
    category: str
    count: int


class DashboardResponse(BaseModel):
    stats: list[DashboardStat]
    weeklyMetrics: list[WeeklyMetric]
    maxVisits: int
    toolUsage: list[ToolUsageRow]
    totalToolSessions: int = 0
    recentActivity: list[ActivityItem]
    blogCategories: list[CategoryStat]
    totalPosts: int
    totalTools: int
    latestPosts: list[BlogPostPublic]


class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=255)
    role: str = "admin"


class AdminUserPublic(BaseModel):
    id: int
    email: str
    name: str
    role: str
    isActive: bool = True
    createdAt: str


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class AdminLoginResponse(BaseModel):
    user: AdminUserPublic
    expiresAt: str


class SiteFaqPublic(BaseModel):
    id: int
    question: str
    answer: str
    sortOrder: int = 0
    isActive: bool = True


class SiteFaqCreate(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1)
    sortOrder: int = 0
    isActive: bool = True


class SiteFaqUpdate(BaseModel):
    question: str | None = Field(default=None, min_length=1, max_length=500)
    answer: str | None = Field(default=None, min_length=1)
    sortOrder: int | None = None
    isActive: bool | None = None


class SiteTestimonialPublic(BaseModel):
    id: int
    name: str
    role: str
    company: str
    quote: str
    avatar: str
    sortOrder: int = 0
    isActive: bool = True


class SiteTestimonialCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    quote: str = Field(min_length=1)
    role: str = Field(default="", max_length=255)
    company: str = Field(default="", max_length=255)
    isActive: bool = True


class SiteTestimonialUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    quote: str | None = Field(default=None, min_length=1)
    role: str | None = Field(default=None, max_length=255)
    company: str | None = Field(default=None, max_length=255)
    isActive: bool | None = None


class SiteLegalHighlightSchema(BaseModel):
    icon: str = "Shield"
    title: str
    text: str


class SiteLegalSectionSchema(BaseModel):
    id: str
    title: str
    contentHtml: str = ""


class SiteLegalPagePublic(BaseModel):
    slug: str
    pageTitle: str
    lastUpdated: str
    highlights: list[SiteLegalHighlightSchema] = Field(default_factory=list)
    sections: list[SiteLegalSectionSchema] = Field(default_factory=list)


class SiteLegalPageUpdate(BaseModel):
    pageTitle: str | None = None
    lastUpdated: str | None = None
    highlights: list[SiteLegalHighlightSchema] | None = None
    sections: list[SiteLegalSectionSchema] | None = None
