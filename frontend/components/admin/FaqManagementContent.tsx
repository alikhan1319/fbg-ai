"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import {
  createAdminSiteFaq,
  deleteAdminSiteFaq,
  fetchAdminSiteFaq,
  updateAdminSiteFaq,
} from "@/services/cmsApi";
import { useToast } from "@/components/ui/ToastProvider";

type FaqRow = {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
};

const emptyForm = { question: "", answer: "", sortOrder: 0, isActive: true };

function normalizeFaqRows(data: unknown): FaqRow[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((row, index) => {
      const record = row as Record<string, unknown>;
      const id = Number(record.id);
      return {
        id,
        question: String(record.question ?? ""),
        answer: String(record.answer ?? ""),
        sortOrder: Number(record.sortOrder ?? record.sort_order ?? index),
        isActive: Boolean(record.isActive ?? record.is_active ?? true),
      };
    })
    .filter((row) => Number.isFinite(row.id) && row.id > 0);
}

export function FaqManagementContent() {
  const { showToast } = useToast();
  const [items, setItems] = useState<FaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSiteFaq();
      setItems(normalizeFaqRows(data));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load FAQ.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: items.length });
  };

  const onEdit = (item: FaqRow) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAdminSiteFaq(editingId, form);
        showToast("FAQ updated.");
      } else {
        await createAdminSiteFaq(form);
        showToast("FAQ added.");
      }
      resetForm();
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (item: FaqRow) => {
    const id = Number(item.id);
    if (!Number.isFinite(id) || id <= 0) {
      showToast("Invalid FAQ item. Refreshing list...", "error");
      await load();
      return;
    }
    if (deletingId === id) return;
    if (!confirm(`Delete FAQ: "${item.question}"?`)) return;

    setDeletingId(id);
    try {
      await deleteAdminSiteFaq(id);
      setItems((prev) => prev.filter((row) => row.id !== id));
      showToast("FAQ deleted.");
      if (editingId === id) resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      if (message.toLowerCase().includes("not found")) {
        await load();
        showToast("FAQ was already removed. List updated.", "info");
      } else {
        showToast(message, "error");
      }
    } finally {
      setDeletingId(null);
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
        title="FAQ"
        description="Manage homepage FAQ items. Changes appear on the live site immediately."
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
        <AdminCard title={editingId ? "Edit FAQ" : "Add FAQ"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-text">Question</label>
              <input
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-text">Answer</label>
              <textarea
                required
                rows={5}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-text">Sort order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm text-brand-text">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active on site
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-secondary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? "Update" : "Add FAQ"}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </AdminCard>

        <AdminCard title="All FAQ items">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-brand-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-brand-text">{item.question}</h3>
                      {!item.isActive ? <AdminBadge variant="warning">Hidden</AdminBadge> : null}
                    </div>
                    <p className="mt-2 text-sm text-brand-muted line-clamp-3">{item.answer}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => onEdit(item)} className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold">
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => onDelete(item)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 ? <p className="text-sm text-brand-muted">No FAQ items yet.</p> : null}
          </div>
        </AdminCard>
      </div>
    </>
  );
}
