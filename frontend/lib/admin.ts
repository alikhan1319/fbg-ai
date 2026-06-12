import { AI_TOOLS } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog-posts";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: "dashboard" | "blog" | "content" | "tools" | "newsletter" | "settings" | "users";
  description?: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "dashboard",
    description: "Overview & analytics",
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: "blog",
    description: "Manage articles",
  },
  {
    label: "Site content",
    href: "/admin/content",
    icon: "content",
    description: "FAQ, legal & copy",
  },
  {
    label: "Tools",
    href: "/admin/tools",
    icon: "tools",
    description: "AI tool settings",
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: "newsletter",
    description: "Subscribers & campaigns",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "users",
    description: "Create admin users",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
    description: "Brand & site config",
  },
];

export type AdminStat = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
};

export type WeeklyMetric = {
  day: string;
  visits: number;
  toolUses: number;
};

export type ToolUsageRow = {
  id: string;
  name: string;
  route: string;
  sessions: number;
  share: number;
};

export type ActivityItem = {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: "blog" | "tool" | "newsletter" | "system";
};

export function getBlogCategoryStats() {
  const counts = new Map<string, number>();
  for (const post of BLOG_POSTS) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAdminDashboardData() {
  const stats: AdminStat[] = [
    { label: "Total visits", value: "24,832", change: "+12.4%", trend: "up" },
    { label: "Tool sessions", value: "8,421", change: "+8.1%", trend: "up" },
    { label: "Blog views", value: "3,156", change: "+18.6%", trend: "up" },
    { label: "Newsletter subs", value: "412", change: "+24", trend: "up" },
  ];

  const weeklyMetrics: WeeklyMetric[] = [
    { day: "Mon", visits: 3120, toolUses: 980 },
    { day: "Tue", visits: 3480, toolUses: 1120 },
    { day: "Wed", visits: 2950, toolUses: 890 },
    { day: "Thu", visits: 3680, toolUses: 1240 },
    { day: "Fri", visits: 4020, toolUses: 1380 },
    { day: "Sat", visits: 2890, toolUses: 760 },
    { day: "Sun", visits: 2692, toolUses: 710 },
  ];

  const maxVisits = Math.max(...weeklyMetrics.map((d) => d.visits));

  const toolUsage: ToolUsageRow[] = AI_TOOLS.map((tool, i) => {
    const sessions = [2840, 1920, 1180, 890, 760, 831][i] ?? 500;
    return {
      id: tool.id,
      name: tool.fullName,
      route: tool.route,
      sessions,
      share: 0,
    };
  });
  const totalSessions = toolUsage.reduce((sum, t) => sum + t.sessions, 0);
  for (const row of toolUsage) {
    row.share = Math.round((row.sessions / totalSessions) * 100);
  }

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      action: "Blog published",
      detail: BLOG_POSTS[0]?.title ?? "Latest article",
      time: "2 hours ago",
      type: "blog",
    },
    {
      id: "2",
      action: "Peak tool usage",
      detail: "Remove BG hit 420 sessions today",
      time: "4 hours ago",
      type: "tool",
    },
    {
      id: "3",
      action: "New subscriber",
      detail: "Newsletter signup from homepage footer",
      time: "6 hours ago",
      type: "newsletter",
    },
    {
      id: "4",
      action: "Blog updated",
      detail: BLOG_POSTS[1]?.title ?? "Article updated",
      time: "Yesterday",
      type: "blog",
    },
    {
      id: "5",
      action: "System check",
      detail: "All AI tools responding normally",
      time: "Yesterday",
      type: "system",
    },
  ];

  return {
    stats,
    weeklyMetrics,
    maxVisits,
    toolUsage,
    recentActivity,
    blogCategories: getBlogCategoryStats(),
    totalPosts: BLOG_POSTS.length,
    totalTools: AI_TOOLS.length,
  };
}

export const MOCK_NEWSLETTER_SUBSCRIBERS = [
  { id: "1", email: "alex.m@example.com", date: "May 28, 2026", source: "Footer" },
  { id: "2", email: "sarah.k@example.com", date: "May 27, 2026", source: "Footer" },
  { id: "3", email: "dev.team@example.com", date: "May 26, 2026", source: "Footer" },
  { id: "4", email: "photo.studio@example.com", date: "May 25, 2026", source: "Footer" },
  { id: "5", email: "shop.owner@example.com", date: "May 24, 2026", source: "Footer" },
];
