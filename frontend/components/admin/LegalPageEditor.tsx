"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { WordPressEditor } from "@/components/admin/WordPressEditor";
import { fetchAdminSiteLegal, updateAdminSiteLegal } from "@/services/cmsApi";
import { useToast } from "@/components/ui/ToastProvider";
import type { SiteLegalHighlight, SiteLegalPage, SiteLegalSection } from "@/lib/site-server";

const ICON_OPTIONS = [
  "Trash2",
  "Eye",
  "Lock",
  "UserCheck",
  "Shield",
  "ShieldCheck",
  "CheckCircle2",
  "Ban",
  "Scale",
  "FileText",
  "Gavel",
  "AlertTriangle",
];

type Props = {
  slug: "privacy" | "terms";
  title: string;
  previewHref: string;
};

export function LegalPageEditor({ slug, title, previewHref }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [highlights, setHighlights] = useState<SiteLegalHighlight[]>([]);
  const [sections, setSections] = useState<SiteLegalSection[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data: SiteLegalPage = await fetchAdminSiteLegal(slug);
      setPageTitle(data.pageTitle);
      setLastUpdated(data.lastUpdated);
      setHighlights(data.highlights || []);
      setSections(data.sections || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load page.");
    } finally {
      setLoading(false);
    }
  }, [slug, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateAdminSiteLegal(slug, {
        pageTitle,
        lastUpdated,
        highlights,
        sections,
      });
      showToast(`${title} saved.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateHighlight = (index: number, patch: Partial<SiteLegalHighlight>) => {
    setHighlights((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const updateSection = (index: number, patch: Partial<SiteLegalSection>) => {
    setSections((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
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
        title={title}
        description="Edit highlights and policy sections. Changes appear on the live page immediately."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={previewHref} target="_blank" className="rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold">
              Preview
            </Link>
            <Link href="/admin/content" className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        }
      />

      <form onSubmit={onSave} className="space-y-6">
        <AdminCard title="Page settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-text">Page title</label>
              <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-text">Last updated</label>
              <input value={lastUpdated} onChange={(e) => setLastUpdated(e.target.value)} placeholder="May 29, 2026" className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Highlights">
          <div className="space-y-4">
            {highlights.map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded-xl border border-brand-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-brand-muted">Icon</label>
                    <select value={item.icon} onChange={(e) => updateHighlight(index, { icon: e.target.value })} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm">
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-brand-muted">Title</label>
                    <input value={item.title} onChange={(e) => updateHighlight(index, { title: e.target.value })} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-semibold text-brand-muted">Text</label>
                  <textarea rows={2} value={item.text} onChange={(e) => updateHighlight(index, { text: e.target.value })} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={() => setHighlights((rows) => rows.filter((_, i) => i !== index))} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove highlight
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setHighlights((rows) => [...rows, { icon: "Shield", title: "New highlight", text: "" }])}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add highlight
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Sections">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={`${section.id}-${index}`} className="rounded-xl border border-brand-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-brand-muted">Section ID</label>
                    <input value={section.id} onChange={(e) => updateSection(index, { id: e.target.value })} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-brand-muted">Section title</label>
                    <input value={section.title} onChange={(e) => updateSection(index, { title: e.target.value })} className="w-full rounded-xl border border-brand-border px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-2 block text-xs font-semibold text-brand-muted">Content</label>
                  <WordPressEditor value={section.contentHtml || "<p></p>"} onChange={(html) => updateSection(index, { contentHtml: html })} />
                </div>
                <button type="button" onClick={() => setSections((rows) => rows.filter((_, i) => i !== index))} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove section
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setSections((rows) => [
                  ...rows,
                  { id: `section-${rows.length + 1}`, title: "New section", contentHtml: "<p></p>" },
                ])
              }
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Add section
            </button>
          </div>
        </AdminCard>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-secondary px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save {title.toLowerCase()}
        </button>
      </form>
    </>
  );
}
