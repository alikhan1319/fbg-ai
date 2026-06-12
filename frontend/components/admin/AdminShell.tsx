"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { ADMIN_NAV, type AdminNavItem } from "@/lib/admin";
import { getAdminInitials } from "@/lib/admin-auth";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  blog: BookOpen,
  content: FileText,
  tools: Wrench,
  newsletter: Mail,
  settings: Settings,
  users: Users,
} as const;

function NavIcon({ item, active }: { item: AdminNavItem; active: boolean }) {
  const Icon = ICONS[item.icon];
  return <Icon className={cn("h-5 w-5 shrink-0", active ? "text-brand-accent" : "text-slate-400")} aria-hidden />;
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAdminAuth();

  const navItems = ADMIN_NAV.filter((item) => {
    if (item.href === "/admin/users" && user && user.role !== "admin") {
      return false;
    }
    return true;
  });

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-white shadow-inner"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <NavIcon item={item} active={active} />
            <span className="min-w-0 truncate">{item.label}</span>
          </Link>
        );
      })}

      <div className="mt-auto border-t border-white/10 pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-5 w-5 shrink-0" aria-hidden />
          View live site
        </Link>
      </div>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAdminAuth();
  const [signingOut, setSigningOut] = useState(false);

  const onLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch {
      setSigningOut(false);
    }
  };

  const initials = user ? getAdminInitials(user.name) : "A";

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-brand-navy/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-brand-navy transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image src={BRAND.icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{BRAND.shortName}</p>
              <p className="truncate text-xs text-slate-400">Admin panel</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Main area */}
      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-border bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-brand-border p-2 text-brand-text hover:bg-brand-card lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-sm text-brand-muted sm:flex">
              <BarChart3 className="h-4 w-4 text-brand-secondary" aria-hidden />
              <span>Admin dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-brand-text">{user.name}</p>
                <p className="text-xs text-brand-muted">{user.email}</p>
              </div>
            ) : (
              <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:inline-flex">
                First-time setup
              </span>
            )}
            {user ? (
              <button
                type="button"
                onClick={onLogout}
                disabled={signingOut}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-3 py-2 text-xs font-semibold text-brand-muted transition hover:bg-brand-card hover:text-brand-text disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
              </button>
            ) : null}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-secondary to-brand-purple text-sm font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-text sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  change,
  trend,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}) {
  const trendColor =
    trend === "up" ? "text-emerald-600 bg-emerald-50" : trend === "down" ? "text-red-600 bg-red-50" : "text-brand-muted bg-brand-card";

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-brand-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-brand-text">{value}</p>
      <span className={cn("mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", trendColor)}>{change}</span>
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-6", className)}>
      {title ? (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-brand-text">{title}</h2>
          {description ? <p className="mt-1 text-sm text-brand-muted">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "purple";
}) {
  const styles = {
    default: "bg-brand-card text-brand-muted",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    purple: "bg-brand-purple/10 text-brand-purple",
  };

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", styles[variant])}>{children}</span>
  );
}
