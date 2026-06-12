"use client";

import { BEFORE_AFTER_EXAMPLES } from "@/lib/constants";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function BeforeAfterSection() {
  return (
    <SectionShell id="results" ariaLabel="Before and after examples">
      <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-brand-purple/10 blur-3xl" aria-hidden />
      <SectionHeading
        label="Results"
        title="See real"
        highlight="transformations"
        description="Drag the slider on each example. Dramatic before-and-after results from portraits to products to photo restoration."
      />

      <StaggerGrid className="mt-14 grid items-start gap-8 lg:grid-cols-3">
        {BEFORE_AFTER_EXAMPLES.map((ex) => (
          <StaggerGridItem key={ex.id} className="flex h-full flex-col">
            <div className="luxury-card image-zoom w-full overflow-hidden rounded-2xl border-0 p-0">
              <CompareSlider
                before={ex.before}
                after={ex.after}
                altBefore={ex.altBefore}
                altAfter={ex.altAfter}
                transparentAfter={ex.transparentAfter}
                imageFit={ex.imageFit}
                aspectClass={ex.aspectClass}
                className="rounded-2xl shadow-none"
              />
            </div>
            <div className="mt-5 text-center">
              <h3 className="font-bold text-brand-text">{ex.title}</h3>
              <p className="mt-1 text-sm text-brand-muted/80">{ex.subtitle}</p>
              <Button asChild variant="outline" className="mt-4 min-h-[44px] text-xs sm:text-sm">
                <Link href={ex.route}>Use this image</Link>
              </Button>
            </div>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}
