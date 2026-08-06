"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Cookie,
  Eye,
  FileText,
  Gavel,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { StudioPageHero } from "@/components/ui/StudioPageHero";
import { SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { BRAND } from "@/lib/constants";
import { PRIMARY_KEYWORD_TITLE } from "@/lib/seo";
import type { SiteLegalPage } from "@/lib/site-server";

const ICONS: Record<string, LucideIcon> = {
  Trash2,
  Eye,
  Lock,
  UserCheck,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Ban,
  Scale,
  FileText,
  Gavel,
  AlertTriangle,
  Cookie,
};

type Props = {
  page: SiteLegalPage;
  variant: "privacy" | "terms";
};

function PolicySection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-brand-border/60 py-10 last:border-0">
      <h2 className="text-xl font-bold text-brand-text sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">{children}</div>
    </section>
  );
}

export function DynamicLegalPageContent({ page, variant }: Props) {
  const isPrivacy = variant === "privacy";
  const badge = isPrivacy ? "Privacy-first platform" : "Legal agreement";
  const heading = isPrivacy ? (
    <>
      Privacy Policy for <span className="text-brand-secondary">{PRIMARY_KEYWORD_TITLE}</span>
    </>
  ) : (
    <>
      Terms of Service for <span className="text-brand-secondary">{PRIMARY_KEYWORD_TITLE}</span>
    </>
  );
  const intro = isPrivacy
    ? `This policy explains how ${BRAND.name} handles your data when you use our free AI tools.`
    : `These terms govern your use of ${BRAND.name} and our six free AI image editing tools.`;

  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <StudioPageHero
          crumbs={[{ label: "Home", href: "/" }, { label: page.pageTitle }]}
          label={badge}
          title={heading}
          description={
            <>
              {intro}
              <span className="mt-3 block text-sm text-white/40">Last updated: {page.lastUpdated}</span>
            </>
          }
        />

        {page.highlights?.length ? (
          <SectionShell className="border-y border-brand-border bg-white py-12 sm:py-14">
            <StaggerGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {page.highlights.map((item) => {
                const Icon = ICONS[item.icon] || Shield;
                return (
                  <StaggerGridItem key={`${item.title}-${item.icon}`}>
                    <div className="h-full border border-brand-border bg-brand-bg p-5">
                      <div className="flex h-10 w-10 items-center justify-center bg-brand-secondary/15 text-brand-secondary">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <h2 className="mt-4 font-display font-bold text-brand-text">{item.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-brand-muted">{item.text}</p>
                    </div>
                  </StaggerGridItem>
                );
              })}
            </StaggerGrid>
          </SectionShell>
        ) : null}

        <SectionShell className="bg-brand-bg pb-28 sm:pb-32" ariaLabel={page.pageTitle}>
          <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <nav
                aria-label="Table of contents"
                className="sticky top-28 border border-brand-border bg-white p-5"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-brand-secondary">On this page</p>
                <ul className="mt-4 space-y-2">
                  {page.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block text-sm text-brand-muted transition-colors hover:text-brand-secondary"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <FadeInView className="border border-brand-border bg-white px-6 py-2 sm:px-10 sm:py-4">
              {page.sections.map((section) => (
                <PolicySection key={section.id} id={section.id} title={section.title}>
                  <div
                    className="legal-content [&_a]:font-semibold [&_a]:text-brand-secondary [&_a:hover]:underline [&_li]:list-disc [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-brand-text [&_ul]:space-y-2 [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: section.contentHtml || "" }}
                  />
                </PolicySection>
              ))}
            </FadeInView>
          </div>
        </SectionShell>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}

export function DynamicLegalPageContentWrapper({
  page,
  variant,
  fallback,
}: {
  page: SiteLegalPage | null;
  variant: "privacy" | "terms";
  fallback: React.ReactNode;
}) {
  if (!page?.sections?.length) return <>{fallback}</>;
  return <DynamicLegalPageContent page={page} variant={variant} />;
}
