"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Eraser,
  Maximize2,
  ImagePlus,
  Stamp,
  Droplets,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Target,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { StudioPageHero } from "@/components/ui/StudioPageHero";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { AI_TOOLS, BRAND, STATS } from "@/lib/constants";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";
import { cn } from "@/lib/utils";

const TOOL_ICONS = {
  eraser: Eraser,
  maximize: Maximize2,
  "image-plus": ImagePlus,
  stamp: Stamp,
  droplets: Droplets,
  sparkles: Sparkles,
} as const;

const VALUES = [
  {
    icon: Heart,
    title: "Free for everyone",
    text: "Core tools stay free — no credit card, no paywall on exports, and no watermark on your downloads.",
  },
  {
    icon: Shield,
    title: "Privacy first",
    text: "Uploads are processed securely and auto-deleted within an hour. Your images are never used to train models without consent.",
  },
  {
    icon: Zap,
    title: "Speed that scales",
    text: "Most background removals finish in seconds, so creators and shops can edit hundreds of photos without slowing down.",
  },
  {
    icon: Target,
    title: "Quality you can ship",
    text: "Hair-level edges, crisp product cutouts, and export-ready PNGs built for e-commerce, social, and design workflows.",
  },
] as const;

export function AboutPageContent() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <StudioPageHero
          crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
          label="Our story"
          title={
            <>
              About <span className="text-brand-secondary">{PRIMARY_KEYWORD_TITLE}</span>
            </>
          }
          description={
            <>
              {PRIMARY_KEYWORD_TITLE} is a free online image studio built around our flagship{" "}
              <Link href="/remove-bg" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                {PRIMARY_KEYWORD} tool
              </Link>
              . Creators, sellers, and teams remove backgrounds, upscale, enhance, and publish faster — from one{" "}
              <Link href="/" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                free AI homepage
              </Link>
              .
            </>
          }
          actions={
            <>
              <Link
                href="/remove-bg"
                className="btn-gradient btn-shine inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm font-semibold text-brand-navy"
              >
                Try background remover
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#tools"
                className="inline-flex min-h-[48px] items-center justify-center border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-brand-secondary hover:text-brand-secondary"
              >
                Explore all free tools
              </Link>
            </>
          }
        >
          <FadeInView className="mt-12 max-w-xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-4 border-b border-white/10 pb-5">
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                width={320}
                height={96}
                className="h-12 w-auto object-contain sm:h-14"
              />
              <div>
                <p className="text-sm font-bold text-white">{BRAND.name}</p>
                <p className="text-xs text-white/45">{BRAND.tagline}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-brand-secondary" />
                Launched as a focused {PRIMARY_KEYWORD} experience
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-brand-secondary" />
                Expanded into six professional AI editing tools
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-brand-secondary" />
                Trusted by 150K+ creators worldwide
              </li>
            </ul>
          </FadeInView>
        </StudioPageHero>

        <SectionShell className="border-y border-brand-border bg-white py-12 sm:py-14">
          <StaggerGrid className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <StaggerGridItem key={stat.label}>
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-brand-text sm:text-4xl">
                    {"prefix" in stat ? stat.prefix : ""}
                    {stat.value}
                    <span className="text-brand-secondary">{stat.suffix}</span>
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                    {stat.label}
                  </p>
                </div>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        <SectionShell ariaLabel="Our mission" className="bg-brand-bg">
          <SectionHeading
            align="left"
            label="Mission"
            title="Making pro image editing"
            highlight="free & accessible"
            description="Everyone deserves studio-quality cutouts — not just teams with expensive subscriptions."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <FadeInView className="border border-brand-border bg-white p-8">
              <h2 className="font-display text-xl font-bold text-brand-text">
                Why we built {PRIMARY_KEYWORD_TITLE}
              </h2>
              <div className="mt-5 space-y-4 text-brand-muted leading-relaxed">
                <p>
                  Background removal used to mean hours in Photoshop or paying per image. We built {BRAND.shortName}{" "}
                  for a better {PRIMARY_KEYWORD} — fast, accurate, and free to start.
                </p>
                <p>
                  Today our{" "}
                  <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                    background remover
                  </Link>{" "}
                  handles portraits, products, and pets. The rest of the{" "}
                  <Link href="/#tools" className="font-semibold text-brand-secondary hover:underline">
                    AI toolkit
                  </Link>{" "}
                  covers upscale, blur, enhance, watermarks, and generated scenes.
                </p>
              </div>
            </FadeInView>
            <FadeInView className="border border-brand-border bg-brand-navy p-8 text-white">
              <h2 className="font-display text-xl font-bold">Who we serve</h2>
              <ul className="mt-5 space-y-4">
                {[
                  "E-commerce sellers who need clean product photos",
                  "Social creators publishing daily content",
                  "Designers who want transparent PNGs without desktop bloat",
                  "Small businesses that need pro visuals on zero budget",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/55">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeInView>
          </div>
        </SectionShell>

        <SectionShell ariaLabel="Company and editorial" className="bg-white">
          <div className="mx-auto max-w-3xl">
            <p className="studio-label">Company</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-brand-text">
              Who publishes {BRAND.shortName}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-muted">
              {BRAND.name} is operated by {BRAND.companyName}. Product guides and blog articles are written by the{" "}
              <strong className="font-semibold text-brand-text">FBG AI Editorial</strong> team for creators,
              sellers, and designers who need clear, practical image-editing help.
            </p>
            <p className="mt-3 text-base leading-relaxed text-brand-muted">
              We are a remote-first team. For support, partnerships, or privacy requests, use our{" "}
              <Link href="/contact" className="font-semibold text-brand-secondary hover:underline">
                contact page
              </Link>{" "}
              — we reply within 24–48 hours on business days. Legal details live in our{" "}
              <Link href="/privacy" className="font-semibold text-brand-secondary hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-semibold text-brand-secondary hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </SectionShell>

        <SectionShell className="bg-white" ariaLabel="Our values">
          <SectionHeading
            label="Values"
            title="What we"
            highlight="stand for"
            description="Every feature we ship is measured against these principles."
          />
          <StaggerGrid className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <StaggerGridItem key={title}>
                <div className="h-full border border-brand-border bg-brand-bg p-6">
                  <div className="flex h-10 w-10 items-center justify-center bg-brand-secondary text-brand-navy">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display font-bold text-brand-text">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{text}</p>
                </div>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        <SectionShell ariaLabel="Our AI tools" className="bg-brand-bg">
          <SectionHeading
            label="Platform"
            title="Six free"
            highlight="AI tools"
            description="Start with background removal, then explore the full suite."
          />
          <StaggerGrid className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool) => {
              const Icon = TOOL_ICONS[tool.icon as keyof typeof TOOL_ICONS];
              const isPrimary = tool.id === "remove-bg";
              return (
                <StaggerGridItem key={tool.id}>
                  <Link
                    href={tool.route}
                    className={cn(
                      "group flex h-full flex-col border bg-white p-6 transition-colors hover:border-brand-navy hover:bg-brand-navy",
                      isPrimary ? "border-brand-secondary" : "border-brand-border"
                    )}
                  >
                    <Icon className="h-6 w-6 text-brand-secondary" />
                    {isPrimary && (
                      <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-secondary">
                        Primary tool
                      </span>
                    )}
                    <h3 className="mt-3 font-display font-bold text-brand-text transition-colors group-hover:text-white">
                      {tool.fullName}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted transition-colors group-hover:text-white/50">
                      {tool.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary">
                      Open tool
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </StaggerGridItem>
              );
            })}
          </StaggerGrid>
        </SectionShell>

        <section className="bg-brand-navy py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-6 text-center sm:px-8">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to try {PRIMARY_KEYWORD_TITLE}?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/55">
              No signup. No watermark. Upload and export in seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/remove-bg"
                className="btn-gradient inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-6 text-sm font-semibold text-brand-navy sm:w-auto"
              >
                Remove background free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[48px] w-full items-center justify-center border border-white/25 px-6 text-sm font-semibold text-white hover:border-brand-secondary hover:text-brand-secondary sm:w-auto"
              >
                Back to homepage
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
