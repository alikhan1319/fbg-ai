"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, HelpCircle, MessageSquare, Shield } from "lucide-react";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { fetchAdminSiteFaq, fetchAdminSiteLegal, fetchAdminSiteTestimonials } from "@/services/cmsApi";

const SECTIONS = [
  { id: "faq", title: "FAQ", description: "Homepage FAQ accordion", icon: HelpCircle, href: "/admin/content/faq", preview: "/#faq" },
  { id: "testimonials", title: "Testimonials", description: "Homepage customer quotes", icon: MessageSquare, href: "/admin/content/testimonials", preview: "/#testimonials" },
  { id: "privacy", title: "Privacy policy", description: "Legal privacy page", icon: Shield, href: "/admin/content/privacy", preview: "/privacy" },
  { id: "terms", title: "Terms of service", description: "Legal terms page", icon: FileText, href: "/admin/content/terms", preview: "/terms" },
];

export function ContentManagementContent() {
  const [counts, setCounts] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetchAdminSiteFaq().then((rows) => ({ faq: `${rows.length} items` })),
      fetchAdminSiteTestimonials().then((rows) => ({ testimonials: `${rows.length} items` })),
      fetchAdminSiteLegal("privacy").then((page) => ({ privacy: page.lastUpdated || "1 page" })),
      fetchAdminSiteLegal("terms").then((page) => ({ terms: page.lastUpdated || "1 page" })),
    ])
      .then((results) => setCounts(Object.assign({}, ...results)))
      .catch(() => setCounts({}));
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Site content"
        description="Manage FAQ, testimonials, and legal pages. All changes sync to the live site."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <AdminCard key={section.id}>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-secondary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-brand-text">{section.title}</h3>
                    <AdminBadge>{counts[section.id] || "…"}</AdminBadge>
                  </div>
                  <p className="mt-1 text-sm text-brand-muted">{section.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={section.preview}
                      target="_blank"
                      className="inline-flex items-center rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-secondary hover:text-brand-secondary"
                    >
                      Preview
                    </Link>
                    <Link
                      href={section.href}
                      className="inline-flex items-center rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-secondary hover:text-brand-secondary"
                    >
                      Edit content
                    </Link>
                  </div>
                </div>
              </div>
            </AdminCard>
          );
        })}
      </div>
    </>
  );
}
