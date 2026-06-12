"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { TestimonialAvatar } from "@/lib/testimonial-avatar";
import {
  createAdminSiteTestimonial,
  deleteAdminSiteTestimonial,
  fetchAdminSiteTestimonials,
  updateAdminSiteTestimonial,
} from "@/services/cmsApi";
import { useToast } from "@/components/ui/ToastProvider";

type TestimonialRow = {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = {
  name: "",
  role: "",
  company: "",
  quote: "",
  isActive: true,
};

export function TestimonialsManagementContent() {
  const { showToast } = useToast();
  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSiteTestimonials();
      setItems(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onEdit = (item: TestimonialRow) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      company: item.company,
      quote: item.quote,
      isActive: item.isActive,
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        quote: form.quote.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        isActive: form.isActive,
      };
      if (editingId) {
        await updateAdminSiteTestimonial(editingId, payload);
        showToast("Testimonial updated.");
      } else {
        await createAdminSiteTestimonial(payload);
        showToast("Testimonial added.");
      }
      resetForm();
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (item: TestimonialRow) => {
    if (!confirm(`Delete testimonial from ${item.name}?`)) return;
    try {
      await deleteAdminSiteTestimonial(item.id);
      showToast("Testimonial deleted.");
      if (editingId === item.id) resetForm();
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
        title="Testimonials"
        description="Name and quote are required. Role and company are optional. Avatar and order are set automatically."
        action={
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text hover:border-brand-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <AdminCard title={editingId ? "Edit testimonial" : "Add testimonial"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-text">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-text">
                Quote <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-text">Role (optional)</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-text">Company (optional)</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
              </div>
            </div>
            {form.name.trim() ? (
              <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-card/40 px-4 py-3">
                <TestimonialAvatar name={form.name} size="sm" />
                <p className="text-sm text-brand-muted">Avatar is generated from the first letter of the name.</p>
              </div>
            ) : null}
            <label className="flex items-center gap-2 text-sm text-brand-text">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active on site
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-secondary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? "Update" : "Add testimonial"}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </AdminCard>

        <AdminCard title="All testimonials">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-brand-border p-4">
                <div className="flex items-start gap-3">
                  <TestimonialAvatar name={item.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-brand-text">{item.name}</h3>
                      <AdminBadge>#{index + 1}</AdminBadge>
                      {!item.isActive ? <AdminBadge variant="warning">Hidden</AdminBadge> : null}
                    </div>
                    {(item.role || item.company) && (
                      <p className="text-xs text-brand-muted">
                        {[item.role, item.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-brand-muted line-clamp-3">&ldquo;{item.quote}&rdquo;</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => onEdit(item)} className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold">
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(item)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
