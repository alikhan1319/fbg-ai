"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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
        {/* Hero */}
        <section className="hero-mesh hero-grid-dots relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-secondary/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-purple/15 blur-3xl" aria-hidden />

          <div className="relative mx-auto w-full max-w-[1280px] px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
              <Link href="/" className="font-medium transition-colors hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <span className="font-semibold text-brand-text">About</span>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-secondary shadow-sm">
                  Our story
                </span>
                <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl lg:text-[3.25rem]">
                  About{" "}
                  <span className="gradient-text-animated">{PRIMARY_KEYWORD_TITLE}</span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
                  {PRIMARY_KEYWORD_TITLE} is a free online image studio built around our flagship{" "}
                  <Link href="/remove-bg" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                    {PRIMARY_KEYWORD} tool
                  </Link>
                  . We help creators, sellers, and teams remove backgrounds, upscale photos, enhance colors, and
                  publish faster — all from one{" "}
                  <Link href="/" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                    free AI homepage
                  </Link>
                  .
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/remove-bg"
                    className="btn-ripple btn-gradient btn-shine inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-secondary/25 transition-transform hover:scale-[1.02]"
                  >
                    Try background remover
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-brand-secondary px-6 py-3.5 text-sm font-semibold text-brand-secondary transition-colors hover:bg-brand-secondary hover:text-white"
                  >
                    Explore all free tools
                  </Link>
                </div>
              </motion.div>

              <FadeInView className="relative">
                <div className="luxury-card overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur">
                  <div className="flex items-center gap-4 border-b border-brand-border pb-5">
                    <div className="rounded-xl bg-white p-2 shadow-sm">
                      <Image
                        src={BRAND.logo}
                        alt={BRAND.name}
                        width={320}
                        height={96}
                        className="h-12 w-auto object-contain sm:h-14"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-text">{BRAND.name}</p>
                      <p className="text-xs text-brand-muted">{BRAND.tagline}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm text-brand-muted">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-secondary" />
                      Launched as a focused {PRIMARY_KEYWORD} experience
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-purple" />
                      Expanded into six professional AI editing tools
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                      Trusted by 150K+ creators worldwide
                    </li>
                  </ul>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* Stats */}
        <SectionShell className="border-y border-brand-border/60 bg-brand-card/40 py-12 sm:py-14">
          <StaggerGrid className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map((stat) => (
              <StaggerGridItem key={stat.label}>
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-brand-text sm:text-4xl">
                    {"prefix" in stat ? stat.prefix : ""}
                    {stat.value}
                    {stat.suffix}
                  </p>
                  <p className="mt-1 text-sm font-medium text-brand-muted">{stat.label}</p>
                </div>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        {/* Mission */}
        <SectionShell ariaLabel="Our mission">
          <SectionHeading
            align="left"
            label="Mission"
            title="Making pro image editing"
            highlight="free & accessible"
            description="We believe everyone deserves studio-quality cutouts and enhancements — not just teams with expensive software subscriptions."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <FadeInView className="luxury-card rounded-2xl border border-brand-border bg-white p-8 shadow-lg">
              <h2 className="text-xl font-bold text-brand-text">Why we built {PRIMARY_KEYWORD_TITLE}</h2>
              <div className="mt-5 space-y-4 text-brand-muted leading-relaxed">
                <p>
                  Background removal used to mean hours in Photoshop or paying per image on single-purpose sites.
                  We started {BRAND.shortName} to deliver a better {PRIMARY_KEYWORD} — fast, accurate, and genuinely
                  free to start.
                </p>
                <p>
                  Today our{" "}
                  <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                    background remover page
                  </Link>{" "}
                  handles portraits, products, and pets with hair-level precision. The rest of our{" "}
                  <Link href="/#tools" className="font-semibold text-brand-secondary hover:underline">
                    AI toolkit on the homepage
                  </Link>{" "}
                  lets you upscale, blur, enhance, remove watermarks, and generate new scenes without switching apps.
                </p>
              </div>
            </FadeInView>
            <FadeInView className="luxury-card rounded-2xl border border-brand-border bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 p-8 shadow-lg">
              <h2 className="text-xl font-bold text-brand-text">Who we serve</h2>
              <ul className="mt-5 space-y-4">
                {[
                  "E-commerce sellers who need clean product photos for Shopify, Amazon, and Etsy",
                  "Social creators publishing daily content on Instagram, TikTok, and YouTube",
                  "Designers and marketers who want transparent PNGs without a heavy desktop workflow",
                  "Small businesses that need professional visuals on a zero budget",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-brand-muted">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeInView>
          </div>
        </SectionShell>

        {/* Values */}
        <SectionShell className="bg-brand-card/50" ariaLabel="Our values">
          <SectionHeading
            label="Values"
            title="What we"
            highlight="stand for"
            description="Every feature we ship is measured against these principles."
          />
          <StaggerGrid className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <StaggerGridItem key={title}>
                <div className="luxury-card h-full rounded-2xl border border-white/70 bg-white/90 p-6 shadow-md transition-shadow hover:shadow-xl">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-secondary to-brand-purple text-white shadow-lg">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-bold text-brand-text">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{text}</p>
                </div>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        {/* Tools */}
        <SectionShell ariaLabel="Our AI tools">
          <SectionHeading
            label="Platform"
            title="Six free"
            highlight="AI tools"
            description="Start with our free background remover AI, then explore the full suite from the homepage."
          />
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-brand-muted">
            Jump to our{" "}
            <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
              free background remover AI
            </Link>{" "}
            or return to the{" "}
            <Link href="/" className="font-semibold text-brand-secondary hover:underline">
              homepage
            </Link>
            .
          </p>
          <StaggerGrid className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool) => {
              const Icon = TOOL_ICONS[tool.icon as keyof typeof TOOL_ICONS];
              const isPrimary = tool.id === "remove-bg";
              return (
                <StaggerGridItem key={tool.id}>
                  <Link
                    href={tool.route}
                    className={cn(
                      "group luxury-card flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                      isPrimary
                        ? "border-brand-secondary/30 bg-gradient-to-br from-brand-secondary/5 to-brand-purple/5"
                        : "border-brand-border bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl text-white",
                        isPrimary ? "bg-gradient-to-br from-brand-secondary to-brand-purple" : "bg-brand-text"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    {isPrimary && (
                      <span className="mt-4 inline-block w-fit rounded-full bg-brand-secondary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
                        Primary tool
                      </span>
                    )}
                    <h3 className="mt-3 font-bold text-brand-text group-hover:text-brand-secondary">{tool.fullName}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{tool.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary">
                      Open tool
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </StaggerGridItem>
              );
            })}
          </StaggerGrid>
        </SectionShell>

        {/* CTA */}
        <SectionShell className="pb-28 sm:pb-32" ariaLabel="Get started">
          <FadeInView className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-navy px-8 py-14 text-center shadow-2xl sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-secondary/20 via-transparent to-brand-purple/20" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to try {PRIMARY_KEYWORD_TITLE}?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
                Upload a photo on our{" "}
                <Link href="/remove-bg" className="font-semibold text-white underline underline-offset-4 hover:text-brand-accent">
                  remove background tool
                </Link>{" "}
                or browse every free feature on the{" "}
                <Link href="/" className="font-semibold text-white underline underline-offset-4 hover:text-brand-accent">
                  main homepage
                </Link>
                . No signup. No watermark.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/remove-bg"
                  className="btn-ripple btn-gradient btn-shine inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg sm:w-auto"
                >
                  Remove background free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </FadeInView>
        </SectionShell>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
