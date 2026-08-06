"use client";

import { Upload, Wand2, Cpu, Download } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerGridItem } from "@/components/ui/motion";

const icons = { upload: Upload, wand: Wand2, cpu: Cpu, download: Download } as const;

export function HowItWorksSection() {
  return (
    <SectionShell id="how-it-works" className="bg-brand-navy" ariaLabel="How it works">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            light
            align="left"
            label="Simple workflow"
            title="Four steps."
            highlight="Zero friction."
            description="Upload, process, refine, download — no account wall in the way."
          />
        </div>

        <StaggerGrid as="ol" className="relative space-y-0">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = icons[step.icon as keyof typeof icons];
            const isLast = i === HOW_IT_WORKS.length - 1;
            return (
              <StaggerGridItem key={step.step} className="list-none">
                <div className={`relative flex gap-6 pb-12 sm:gap-8 ${isLast ? "pb-0" : ""}`}>
                  {!isLast && (
                    <div
                      className="absolute left-[23px] top-14 bottom-0 w-px bg-white/10 sm:left-[27px]"
                      aria-hidden
                    />
                  )}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center bg-brand-secondary text-brand-navy sm:h-14 sm:w-14">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-4xl font-bold tabular-nums leading-none text-white/15 sm:text-5xl">
                        {String(step.step).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              </StaggerGridItem>
            );
          })}
        </StaggerGrid>
      </div>
    </SectionShell>
  );
}
