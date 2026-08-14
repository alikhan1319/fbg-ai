"use client";

import {
  Eraser,
  Maximize2,
  ImagePlus,
  Stamp,
  Droplets,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { AI_TOOLS } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import Link from "next/link";

const icons = {
  eraser: Eraser,
  maximize: Maximize2,
  "image-plus": ImagePlus,
  stamp: Stamp,
  droplets: Droplets,
  sparkles: Sparkles,
} as const;

export function ToolsGridSection() {
  const [primary, ...rest] = AI_TOOLS;
  const PrimaryIcon = icons[primary.icon as keyof typeof icons];

  return (
    <SectionShell id="tools" className="bg-brand-bg" ariaLabel="AI image editing tools">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          align="left"
          className="max-w-xl"
          label="All-in-one studio"
          title="Six tools."
          highlight="One workflow."
          description="Start with background removal, then upscale, enhance, blur, clean watermarks, or generate a new scene."
        />
        <FadeInView className="hidden lg:block">
          <p className="max-w-xs text-right text-sm text-brand-muted">
            Pick a tool. No signup. Results in seconds.
          </p>
        </FadeInView>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-12 lg:gap-5">
        <FadeInView className="lg:col-span-5">
          <Link
            href={primary.route}
            id={primary.id}
            className="group relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden bg-brand-navy p-8 text-white sm:p-10 lg:min-h-[420px]"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-secondary/20 blur-3xl transition-opacity group-hover:opacity-100"
              aria-hidden
            />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-secondary">
                Flagship tool
              </span>
              <PrimaryIcon className="mt-8 h-10 w-10 text-brand-secondary" />
              <h3 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {primary.fullName}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
                {primary.description}
              </p>
            </div>
            <span className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary">
              Open tool
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </FadeInView>

        <StaggerGrid className="flex flex-col gap-3 lg:col-span-7">
          {rest.map((tool, i) => {
            const Icon = icons[tool.icon as keyof typeof icons];
            return (
              <StaggerGridItem key={tool.id}>
                <Link
                  href={tool.route}
                  id={tool.id}
                  className="group flex items-start gap-5 border border-brand-border bg-white p-5 transition-colors hover:border-brand-navy hover:bg-brand-navy sm:items-center sm:p-6"
                >
                  <span className="font-display text-2xl font-bold tabular-nums text-brand-muted transition-colors group-hover:text-white/70 sm:text-3xl">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-brand-border text-brand-navy transition-colors group-hover:border-brand-secondary/40 group-hover:text-brand-secondary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-bold text-brand-text transition-colors group-hover:text-white">
                      {tool.fullName}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-brand-muted transition-colors group-hover:text-white/50">
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 hidden h-5 w-5 shrink-0 text-brand-secondary opacity-0 transition-all group-hover:opacity-100 sm:mt-0 sm:block" />
                </Link>
              </StaggerGridItem>
            );
          })}
        </StaggerGrid>
      </div>
    </SectionShell>
  );
}
