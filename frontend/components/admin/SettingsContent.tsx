"use client";

import { BRAND, CONTACT, LEGAL, SITE_URL } from "@/lib/constants";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { useToast } from "@/components/ui/ToastProvider";

export function SettingsContent() {
  const { showToast } = useToast();

  const fields = [
    { label: "Site name", value: BRAND.name },
    { label: "Short name", value: BRAND.shortName },
    { label: "Company", value: BRAND.companyName },
    { label: "Tagline", value: BRAND.tagline },
    { label: "Site URL", value: SITE_URL },
    { label: "Support email", value: CONTACT.supportEmail },
    { label: "General email", value: CONTACT.generalEmail },
    { label: "Privacy email", value: CONTACT.privacyEmail },
    { label: "Privacy last updated", value: LEGAL.privacyLastUpdated },
    { label: "Terms last updated", value: LEGAL.termsLastUpdated },
  ];

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Brand, contact, and site configuration. Values are currently loaded from constants."
        action={
          <button
            type="button"
            onClick={() => showToast("Settings save — connect backend to persist changes.")}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy/90"
          >
            Save changes
          </button>
        }
      />

      <AdminCard title="Site configuration">
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="rounded-xl border border-brand-border bg-brand-bg/50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{field.label}</dt>
              <dd className="mt-2 text-sm font-medium text-brand-text">{field.value}</dd>
            </div>
          ))}
        </dl>
      </AdminCard>
    </>
  );
}
