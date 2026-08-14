"use client";

import {
  Brain,
  Gift,
  Shield,
  BadgeCheck,
  Image,
  Layers,
  Scan,
  Smartphone,
  Zap,
  FileImage,
} from "lucide-react";
import { KEY_FEATURES } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerGridItem } from "@/components/ui/motion";

const icons = {
  brain: Brain,
  gift: Gift,
  shield: Shield,
  "badge-check": BadgeCheck,
  image: Image,
  layers: Layers,
  scan: Scan,
  smartphone: Smartphone,
  zap: Zap,
  "file-image": FileImage,
} as const;

export function KeyFeaturesSection() {
  return (
    <SectionShell id="features" className="bg-brand-bg" ariaLabel="Key features">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            label="Built for creators"
            title="Features that"
            highlight="stay out of the way."
            description="Speed, quality, and privacy — whether you edit one photo or hundreds."
          />
          <p className="mt-8 hidden text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted lg:block">
            {KEY_FEATURES.length} capabilities · no paywall on core edits
          </p>
        </div>

        <StaggerGrid className="grid gap-3 sm:grid-cols-2">
          {KEY_FEATURES.map((f, i) => {
            const Icon = icons[f.icon as keyof typeof icons];
            return (
              <StaggerGridItem key={f.title}>
                <article className="group relative h-full overflow-hidden border border-brand-border bg-white p-6 transition-colors hover:border-brand-navy hover:bg-brand-navy">
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="h-5 w-5 text-brand-secondary" />
                    <span className="font-display text-xs font-bold tabular-nums text-brand-muted transition-colors group-hover:text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-bold text-brand-text transition-colors group-hover:text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted transition-colors group-hover:text-white/50">
                    {f.description}
                  </p>
                </article>
              </StaggerGridItem>
            );
          })}
        </StaggerGrid>
      </div>
    </SectionShell>
  );
}
