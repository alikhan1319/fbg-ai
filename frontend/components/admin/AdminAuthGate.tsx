"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { fetchAdminBootstrapStatus } from "@/services/cmsApi";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAdminAuth();
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";
  const isUsersPage = pathname === "/admin/users" || pathname.startsWith("/admin/users/");

  useEffect(() => {
    fetchAdminBootstrapStatus()
      .then((data) => setNeedsBootstrap(data.needsBootstrap))
      .catch(() => setNeedsBootstrap(false));
  }, []);

  useEffect(() => {
    if (loading || needsBootstrap === null) return;

    if (isLoginPage && user) {
      const next = searchParams.get("next") || "/admin/dashboard";
      router.replace(next.startsWith("/admin") ? next : "/admin/dashboard");
      return;
    }

    const allowWithoutAuth = isLoginPage || (needsBootstrap && isUsersPage);
    if (!user && !allowWithoutAuth) {
      const next = encodeURIComponent(pathname);
      router.replace(`/admin/login?next=${next}`);
    }
  }, [loading, needsBootstrap, user, isLoginPage, isUsersPage, pathname, router, searchParams]);

  if (loading || needsBootstrap === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" aria-hidden />
        <span className="sr-only">Loading admin…</span>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const allowBootstrap = needsBootstrap && isUsersPage;
  if (!user && !allowBootstrap) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
