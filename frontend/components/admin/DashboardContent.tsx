"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Loader2,
  Mail,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { AdminBadge, AdminCard, AdminPageHeader, AdminStatCard } from "@/components/admin/AdminShell";
import { fetchAdminDashboard } from "@/services/cmsApi";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS = {
  blog: BookOpen,
  tool: Wrench,
  newsletter: Mail,
  system: Sparkles,
} as const;

type DashboardData = Awaited<ReturnType<typeof fetchAdminDashboard>>;

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <AdminCard>
        <p className="text-sm text-red-600">{error || "Failed to load dashboard."}</p>
        <p className="mt-2 text-sm text-brand-muted">Make sure MySQL is running and the backend is started on port 8000.</p>
      </AdminCard>
    );
  }

  const totalToolSessions =
    data.totalToolSessions ?? data.toolUsage.reduce((sum, tool) => sum + tool.sessions, 0);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Live analytics from your MySQL database — visits, tool usage, blog views, and newsletter signups."
        action={
          <Link
            href="/admin/blog"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
          >
            Manage blog
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} trend={stat.trend as "up" | "down" | "neutral"} />
        ))}
      </div>

      <AdminCard title="Blog categories" description={`${data.totalPosts} published articles`} className="mt-8">
        <ul className="space-y-3">
          {data.blogCategories.map((row) => (
            <li key={row.category} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium text-brand-text">{row.category}</span>
              <AdminBadge variant="purple">{row.count} posts</AdminBadge>
            </li>
          ))}
        </ul>
      </AdminCard>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <AdminCard
          title="Tool usage"
          description={
            totalToolSessions > 0
              ? `${totalToolSessions.toLocaleString()} total sessions — most used tools first`
              : "Real usage from MySQL — use any AI tool on the site to populate this chart"
          }
        >
          {totalToolSessions === 0 ? (
            <p className="text-sm text-brand-muted">
              No tool sessions recorded yet. Process an image with Background Remover, Upscaler, or any other tool,
              then refresh this page.
            </p>
          ) : (
            <div className="space-y-4">
              {data.toolUsage
                .filter((tool) => tool.sessions > 0)
                .map((tool, index) => {
                  const topSessions = data.toolUsage[0]?.sessions || 1;
                  const barWidth = Math.max(Math.round((tool.sessions / topSessions) * 100), 8);
                  return (
                    <div key={tool.id}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-brand-text">
                          {index === 0 ? (
                            <>
                              <span className="mr-2 text-brand-secondary">#1</span>
                              {tool.name}
                            </>
                          ) : (
                            tool.name
                          )}
                        </span>
                        <span className="text-brand-muted">
                          {tool.sessions.toLocaleString()} · {tool.share}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-brand-card">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-secondary to-brand-purple"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </AdminCard>

        <AdminCard title="Recent activity" description="Latest updates across the site">
          <ul className="space-y-4">
            {data.recentActivity.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type as keyof typeof ACTIVITY_ICONS] || Sparkles;
              return (
                <li key={item.id} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-secondary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-text">{item.action}</p>
                    <p className="truncate text-sm text-brand-muted">{item.detail}</p>
                    <p className="mt-1 text-xs text-brand-muted">{item.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </AdminCard>
      </div>

      <AdminCard title="Latest blog posts" description="Quick links to your most recent articles" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.latestPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              target="_blank"
              className="group rounded-xl border border-brand-border p-4 transition-colors hover:border-brand-secondary/40 hover:bg-brand-card/40"
            >
              <div className="flex items-start justify-between gap-3">
                <AdminBadge variant="purple">{post.category}</AdminBadge>
                <TrendingUp className="h-4 w-4 text-brand-muted transition-colors group-hover:text-brand-secondary" aria-hidden />
              </div>
              <h3 className={cn("mt-3 line-clamp-2 text-sm font-bold text-brand-text group-hover:text-brand-secondary")}>
                {post.title}
              </h3>
              <p className="mt-2 text-xs text-brand-muted">{post.date}</p>
            </Link>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
