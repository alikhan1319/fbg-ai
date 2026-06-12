import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-brand-bg text-brand-muted">
            Loading…
          </div>
        }
      >
        <AdminAuthGate>{children}</AdminAuthGate>
      </Suspense>
    </AdminAuthProvider>
  );
}
