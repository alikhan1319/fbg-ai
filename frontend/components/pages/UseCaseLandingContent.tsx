import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionShell } from "@/components/ui/SectionHeading";
import { BreadcrumbSchema, ToolFAQSchema, ToolWebPageSchema } from "@/components/tool/ToolSchemas";
import { UseCaseToolWorkspace } from "@/components/pages/UseCaseToolWorkspace";
import { landingPath, type UseCaseLanding, getUseCasesByTool } from "@/lib/use-case-landings";

export function UseCaseLandingContent({ landing }: { landing: UseCaseLanding }) {
  const path = landingPath(landing);
  const siblings = getUseCasesByTool(landing.toolId).filter((item) => item.slug !== landing.slug).slice(0, 6);

  return (
    <>
      <ToolWebPageSchema name={landing.title} description={landing.description} urlPath={path} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: landing.toolLabel, path: landing.toolHref },
          { name: landing.h1, path },
        ]}
      />
      <ToolFAQSchema items={landing.faqs} />

      <Navbar />
      <main className="overflow-x-clip">
        <section className="hero-studio relative overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-12" aria-label="Hero">
          <div className="hero-studio-grain absolute inset-0" aria-hidden />
          <div className="relative mx-auto w-full max-w-[1200px] px-6 sm:px-8">
            <nav className="text-sm text-white/45" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-brand-secondary">
                    Home
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href={landing.toolHref} className="hover:text-brand-secondary">
                    {landing.toolLabel}
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-white/70">{landing.h1}</li>
              </ol>
            </nav>
            <p className="studio-label mt-8">Use case · {landing.toolLabel}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {landing.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">{landing.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#upload"
                className="btn-gradient btn-shine inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm font-semibold text-brand-navy"
              >
                {landing.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href={landing.toolHref}
                className="inline-flex min-h-[48px] items-center justify-center border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-brand-secondary hover:text-brand-secondary"
              >
                Open full tool
              </Link>
            </div>
          </div>
        </section>

        <UseCaseToolWorkspace landing={landing} />

        <SectionShell className="bg-brand-bg" ariaLabel="Guide content">
          <div className="mx-auto max-w-3xl space-y-12">
            {landing.sections.map((section) => (
              <article key={section.heading}>
                <h2 className="font-display text-2xl font-bold text-brand-text sm:text-3xl">{section.heading}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 48)} className="mt-4 text-base leading-relaxed text-brand-muted">
                    {p}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </SectionShell>

        <SectionShell className="bg-white" ariaLabel="Frequently asked questions">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-brand-text sm:text-3xl">FAQ</h2>
            <div className="mt-8 divide-y divide-brand-border border-y border-brand-border">
              {landing.faqs.map((faq) => (
                <div key={faq.question} className="py-6">
                  <h3 className="font-display text-lg font-bold text-brand-text">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>

        <SectionShell className="bg-brand-bg" ariaLabel="Related pages">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-brand-text">Related guides</h2>
            <ul className="mt-6 space-y-3">
              {landing.relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="group flex items-center justify-between gap-4 border border-brand-border bg-white px-4 py-4 transition-colors hover:border-brand-secondary"
                  >
                    <span className="font-medium text-brand-text group-hover:text-brand-secondary">{g.title}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand-secondary" />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={landing.toolHref}
                  className="group flex items-center justify-between gap-4 border border-brand-navy bg-brand-navy px-4 py-4 text-white"
                >
                  <span className="font-medium">Open {landing.toolLabel} tool</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-secondary" />
                </Link>
              </li>
            </ul>

            {siblings.length > 0 ? (
              <>
                <h2 className="mt-14 font-display text-2xl font-bold text-brand-text">More {landing.toolLabel} searches</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {siblings.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={landingPath(item)}
                        className="block border border-brand-border bg-white px-4 py-3 text-sm font-medium text-brand-text transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                      >
                        {item.h1}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </SectionShell>
      </main>
      <Footer />
    </>
  );
}
