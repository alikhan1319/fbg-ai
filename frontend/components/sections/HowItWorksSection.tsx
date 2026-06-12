"use client";

import { Upload, Wand2, Cpu, Download } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerGridItem } from "@/components/ui/motion";

const icons = { upload: Upload, wand: Wand2, cpu: Cpu, download: Download } as const;

export function HowItWorksSection() {
  return (
    <SectionShell id="how-it-works" className="bg-brand-card" ariaLabel="How it works">
      <div className="section-divider absolute inset-x-0 top-0" />
      <SectionHeading
        label="Simple workflow"
        title="How it"
        highlight="works"
        description="Four easy steps from upload to download — no technical skills required."
      />

      <StaggerGrid as="ol" className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {HOW_IT_WORKS.map((step) => {
          const Icon = icons[step.icon as keyof typeof icons];
          return (
            <StaggerGridItem key={step.step} className="list-none">
              <div className="luxury-card relative h-full p-6 text-center">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-3 py-0.5 text-xs font-bold text-white shadow-md">
                  Step {step.step}
                </span>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 text-brand-primary transition-all duration-300 group-hover:from-brand-primary group-hover:to-brand-secondary group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-bold text-brand-text">{step.title}</h3>
                <p className="mt-2 text-sm text-brand-muted">{step.description}</p>
              </div>
            </StaggerGridItem>
          );
        })}
      </StaggerGrid>
    </SectionShell>
  );
}
