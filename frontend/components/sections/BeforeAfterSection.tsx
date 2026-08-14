"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BEFORE_AFTER_EXAMPLES } from "@/lib/constants";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerGridItem } from "@/components/ui/motion";

const SHORT_LABELS: Record<string, string> = {
  portrait: "Portrait",
  product: "Product",
  "generated-bg": "Pet scene",
};

export function BeforeAfterSection() {
  return (
    <SectionShell id="results" className="bg-brand-bg" ariaLabel="Before and after examples">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          label="Results"
          title="Real edits."
          highlight="Real edges."
          description="Drag any slider. Same free tools you use on this site — no staged studio samples."
        />
      </div>

      <StaggerGrid className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
        {BEFORE_AFTER_EXAMPLES.map((ex, i) => (
          <StaggerGridItem key={ex.id} className="flex flex-col">
            <div className="overflow-hidden bg-[#e8eaed]">
              <CompareSlider
                before={ex.before}
                after={ex.after}
                altBefore={ex.altBefore}
                altAfter={ex.altAfter}
                transparentAfter={ex.transparentAfter}
                imageFit="cover"
                aspectClass="aspect-[3/4]"
                className="rounded-none border-0 bg-[#e8eaed] shadow-none"
              />
            </div>

            <div className="mt-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-ink">
                  {String(i + 1).padStart(2, "0")} · {SHORT_LABELS[ex.id] ?? ex.id}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-brand-text">
                  {ex.title.replace(/\s*—\s*/, " · ")}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{ex.subtitle}</p>
              </div>
              <Link
                href={ex.route}
                aria-label={`Try ${ex.title}`}
                className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border border-brand-border bg-white text-brand-navy transition-colors hover:border-brand-secondary hover:bg-brand-secondary"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </StaggerGridItem>
        ))}
      </StaggerGrid>

      <p className="mt-10 text-center text-xs text-brand-muted">
        Drag the handle left and right to compare before and after
      </p>
    </SectionShell>
  );
}
