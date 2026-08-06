import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionShell } from "@/components/ui/SectionHeading";
import { BreadcrumbSchema, ToolWebPageSchema } from "@/components/tool/ToolSchemas";
import {
  getUseCasesByTool,
  landingPath,
  type LandingToolId,
} from "@/lib/use-case-landings";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Use Cases & Landing Guides | ${BRAND.shortName} Free AI Tools`,
  description:
    "Browse long-tail use-case guides for background removal, upscaling, enhancement, blur, AI backgrounds, and watermark cleanup — free tools, no signup.",
  alternates: { canonical: "/use-cases" },
  robots: { index: true, follow: true },
};

const GROUPS: { toolId: LandingToolId; title: string; toolHref: string }[] = [
  { toolId: "remove-bg", title: "Remove background", toolHref: "/remove-bg" },
  { toolId: "upscale", title: "Upscale images", toolHref: "/upscale" },
  { toolId: "enhance", title: "Enhance photos", toolHref: "/enhance-image" },
  { toolId: "blur-bg", title: "Blur background", toolHref: "/blur-background" },
  { toolId: "gen-bg", title: "Generate background", toolHref: "/generate-background" },
  { toolId: "watermark", title: "Remove watermark", toolHref: "/remove-watermark" },
];

export default function UseCasesHubPage() {
  return (
    <>
      <ToolWebPageSchema
        name={`Use Cases | ${BRAND.name}`}
        description="Long-tail landing pages for every FBG AI tool."
        urlPath="/use-cases"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Use cases", path: "/use-cases" },
        ]}
      />
      <Navbar />
      <main className="overflow-x-clip">
        <section className="hero-studio relative overflow-hidden pt-24 pb-12 sm:pt-28" aria-label="Use cases">
          <div className="hero-studio-grain absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-[1200px] px-6 sm:px-8">
            <p className="studio-label">SEO guides</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold text-white sm:text-5xl">
              Use cases people actually search
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/60">
              Focused landing pages for each free AI tool — built for long-tail queries, with clear CTAs back to the live workspace.
            </p>
          </div>
        </section>

        {GROUPS.map((group) => {
          const items = getUseCasesByTool(group.toolId);
          return (
            <SectionShell key={group.toolId} className="bg-brand-bg even:bg-white" ariaLabel={group.title}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="studio-label">{group.title}</p>
                  <h2 className="mt-3 font-display text-2xl font-bold text-brand-text sm:text-3xl">
                    {items.length} search landings
                  </h2>
                </div>
                <Link
                  href={group.toolHref}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:underline"
                >
                  Open tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={landingPath(item)}
                      className="flex h-full flex-col border border-brand-border bg-white p-5 transition-colors hover:border-brand-secondary"
                    >
                      <span className="font-display text-base font-bold text-brand-text">{item.h1}</span>
                      <span className="mt-2 line-clamp-2 text-sm text-brand-muted">{item.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </SectionShell>
          );
        })}
      </main>
      <Footer />
    </>
  );
}
