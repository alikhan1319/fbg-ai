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
import { StaggerGrid, StaggerGridItem, PremiumCard } from "@/components/ui/motion";

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
    <SectionShell id="features" ariaLabel="Key features">
      <SectionHeading
        label="Why creators choose us"
        title="Key"
        highlight="features"
        description="Built for speed, quality, and privacy — whether you edit one photo or hundreds."
      />

      <StaggerGrid className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {KEY_FEATURES.map((f) => {
          const Icon = icons[f.icon as keyof typeof icons];
          return (
            <StaggerGridItem key={f.title}>
              <PremiumCard className="h-full p-5">
                <Icon className="h-6 w-6 text-brand-primary transition-colors duration-300 group-hover:text-brand-secondary" />
                <h3 className="mt-3 text-sm font-bold text-brand-text">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">{f.description}</p>
              </PremiumCard>
            </StaggerGridItem>
          );
        })}
      </StaggerGrid>
    </SectionShell>
  );
}
