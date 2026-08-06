"use client";

import { Check, X, ArrowRight } from "lucide-react";
import { WHY_CHOOSE, BRAND } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView } from "@/components/ui/motion";
import Link from "next/link";

const ROW_LABELS = [
  "Free access",
  "Tool variety",
  "Data privacy",
  "Clean exports",
  "Edge quality",
  "Mobile UX",
];

export function WhyChooseUsSection() {
  return (
    <SectionShell id="why-us" className="bg-white" ariaLabel="Why choose us">
      <SectionHeading
        align="left"
        label="Comparison"
        title="Why choose"
        highlight={BRAND.shortName}
        description="Side-by-side with typical single-purpose tools — what you keep, what they cut."
      />

      <FadeInView className="mt-14 grid gap-5 lg:grid-cols-2">
        <div className="relative overflow-hidden border border-brand-navy bg-brand-navy p-7 text-white sm:p-9">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-2xl font-bold tracking-tight">{BRAND.shortName}</h3>
            <span className="bg-brand-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-navy">
              Recommended
            </span>
          </div>
          <p className="mt-3 text-sm text-white/50">Built as a studio, not a single button.</p>
          <ul className="mt-8 space-y-4">
            {WHY_CHOOSE.us.map((row, i) => (
              <li key={row} className="flex items-start gap-3 border-t border-white/10 pt-4 first:border-0 first:pt-0">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-brand-secondary/20 text-brand-secondary">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{ROW_LABELS[i]}</p>
                  <p className="mt-0.5 text-sm text-white/50">{row}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/remove-bg"
            className="mt-9 inline-flex min-h-[44px] items-center gap-2 bg-brand-secondary px-5 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-90"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="border border-brand-border bg-brand-bg p-7 sm:p-9">
          <h3 className="font-display text-2xl font-bold tracking-tight text-brand-muted">Others</h3>
          <p className="mt-3 text-sm text-brand-muted">Single-purpose tools with the usual tradeoffs.</p>
          <ul className="mt-8 space-y-4">
            {WHY_CHOOSE.others.map((row, i) => (
              <li key={row} className="flex items-start gap-3 border-t border-brand-border pt-4 first:border-0 first:pt-0">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-white text-brand-muted/60">
                  <X className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-text">{ROW_LABELS[i]}</p>
                  <p className="mt-0.5 text-sm text-brand-muted">{row}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </FadeInView>
    </SectionShell>
  );
}
