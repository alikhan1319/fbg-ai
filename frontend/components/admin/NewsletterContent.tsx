"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Loader2, Mail, Trash2, Users } from "lucide-react";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { deleteAdminNewsletterSubscriber, exportAdminNewsletter, fetchAdminNewsletter } from "@/services/cmsApi";
import { useToast } from "@/components/ui/ToastProvider";

type Subscriber = {
  id: number;
  email: string;
  source: string;
  date: string;
};

export function NewsletterContent() {
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminNewsletter();
      setSubscribers(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const weekCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return subscribers.filter((s) => {
      const parsed = Date.parse(s.date);
      return Number.isFinite(parsed) && parsed >= weekAgo;
    }).length;
  }, [subscribers]);

  const onDelete = async (sub: Subscriber) => {
    if (!confirm(`Remove ${sub.email} from the list?`)) return;
    try {
      await deleteAdminNewsletterSubscriber(sub.id);
      showToast("Subscriber removed.");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Newsletter"
        description="Live subscriber list from MySQL — signups from the site footer."
        action={
          <button
            type="button"
            onClick={async () => {
              try {
                await exportAdminNewsletter();
                showToast("Newsletter CSV downloaded.");
              } catch (err) {
                showToast(err instanceof Error ? err.message : "Export failed.");
              }
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-text hover:border-brand-secondary"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminCard>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-brand-muted">Total subscribers</p>
              <p className="text-2xl font-extrabold text-brand-text">{subscribers.length}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-brand-muted">This week</p>
              <p className="text-2xl font-extrabold text-brand-text">+{weekCount}</p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-card text-brand-secondary">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-brand-muted">Source</p>
              <p className="text-2xl font-extrabold text-brand-text">Footer</p>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="All subscribers" description="Stored in MySQL database fbgai">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-border text-xs uppercase tracking-wider text-brand-muted">
                <th className="pb-3 pr-4 font-semibold">Email</th>
                <th className="pb-3 pr-4 font-semibold">Date</th>
                <th className="pb-3 pr-4 font-semibold">Source</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-brand-border/70 last:border-0">
                  <td className="py-3 pr-4 font-medium text-brand-text">{sub.email}</td>
                  <td className="py-3 pr-4 text-brand-muted">{sub.date}</td>
                  <td className="py-3 pr-4">
                    <AdminBadge>{sub.source}</AdminBadge>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onDelete(sub)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subscribers.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-muted">No subscribers yet. Sign up via the site footer.</p>
          ) : null}
        </div>
      </AdminCard>
    </>
  );
}
