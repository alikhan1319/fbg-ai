"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { AI_TOOLS } from "@/lib/constants";
import { useToast } from "@/components/ui/ToastProvider";

export function ToolsManagementContent() {
  const { showToast } = useToast();

  return (
    <>
      <AdminPageHeader
        title="AI tools"
        description="Manage tool names, descriptions, routes, and showcase settings for all six AI tools."
      />

      <AdminCard>
        <div className="space-y-4">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="flex flex-col gap-4 rounded-xl border border-brand-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-brand-text">{tool.fullName}</h3>
                  {tool.id === "remove-bg" ? <AdminBadge variant="success">Primary</AdminBadge> : null}
                  <AdminBadge>{tool.route}</AdminBadge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{tool.description}</p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={tool.route}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-secondary hover:text-brand-secondary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View tool
                </Link>
                <button
                  type="button"
                  onClick={() => showToast(`Edit ${tool.fullName} settings — coming soon.`)}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-secondary hover:text-brand-secondary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
