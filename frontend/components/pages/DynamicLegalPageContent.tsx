"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
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
import { SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { BRAND } from "@/lib/constants";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";
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
  const HeroIcon = isPrivacy ? Shield : FileText;
  const badge = isPrivacy ? "Privacy-first platform" : "Legal agreement";
  const heading = isPrivacy ? (
    <>
      Privacy Policy for <span className="gradient-text-animated">{PRIMARY_KEYWORD_TITLE}</span>
    </>
  ) : (
    <>
      Terms of Service for <span className="gradient-text-animated">{PRIMARY_KEYWORD_TITLE}</span>
    </>
  );
  const intro = isPrivacy
    ? `This policy explains how ${BRAND.name} handles your data when you use our free AI tools.`
    : `These terms govern your use of ${BRAND.name} and our six free AI image editing tools.`;

  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <section className="hero-mesh hero-grid-dots relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="relative mx-auto w-full max-w-[1280px] px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
              <Link href="/" className="font-medium transition-colors hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <span className="font-semibold text-brand-text">{page.pageTitle}</span>
            </nav>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-secondary shadow-sm">
                <HeroIcon className="h-3.5 w-3.5" aria-hidden />
                {badge}
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl">{heading}</h1>
              <p className="mt-6 text-lg leading-relaxed text-brand-muted">{intro}</p>
              <p className="mt-4 text-sm font-medium text-brand-muted">Last updated: {page.lastUpdated}</p>
            </motion.div>
          </div>
        </section>

        {page.highlights?.length ? (
          <SectionShell className="border-y border-brand-border/60 bg-brand-card/40 py-12 sm:py-14">
            <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {page.highlights.map((item) => {
                const Icon = ICONS[item.icon] || Shield;
                return (
                  <StaggerGridItem key={`${item.title}-${item.icon}`}>
                    <div className="luxury-card h-full rounded-2xl border border-white/70 bg-white p-5 shadow-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <h2 className="mt-4 font-bold text-brand-text">{item.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-brand-muted">{item.text}</p>
                    </div>
                  </StaggerGridItem>
                );
              })}
            </StaggerGrid>
          </SectionShell>
        ) : null}

        <SectionShell className="pb-28 sm:pb-32" ariaLabel={page.pageTitle}>
          <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <nav aria-label="Table of contents" className="sticky top-28 rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">On this page</p>
                <ul className="mt-4 space-y-2">
                  {page.sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="block text-sm text-brand-muted transition-colors hover:text-brand-secondary">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <FadeInView className="luxury-card rounded-3xl border border-brand-border bg-white px-6 py-2 shadow-lg sm:px-10 sm:py-4">
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
