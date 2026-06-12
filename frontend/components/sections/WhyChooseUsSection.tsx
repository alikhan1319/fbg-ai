"use client";

import { Check, X } from "lucide-react";
import { WHY_CHOOSE, BRAND } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView } from "@/components/ui/motion";

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
    <SectionShell id="why-us" className="bg-brand-card" ariaLabel="Why choose us">
      <div className="section-divider absolute inset-x-0 top-0" />
      <SectionHeading
        label="Comparison"
        title="Why choose"
        highlight={BRAND.shortName}
        description="See how our free background remover AI platform compares to typical single-purpose tools."
      />

      <FadeInView className="mt-14 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-xl luxury-card">
        <div className="grid grid-cols-3 border-b border-brand-border bg-gradient-to-r from-brand-primary/8 to-brand-accent/5 text-sm font-bold text-brand-text">
          <div className="p-4 sm:p-6">Feature</div>
          <div className="border-x border-brand-border p-4 text-center text-brand-primary sm:p-6">{BRAND.shortName}</div>
          <div className="p-4 text-center text-brand-muted sm:p-6">Others</div>
        </div>
        {WHY_CHOOSE.us.map((row, i) => (
          <div
            key={row}
            className="grid grid-cols-3 border-b border-brand-border text-sm transition-colors duration-300 last:border-0 hover:bg-brand-card/50"
          >
            <div className="p-4 font-medium text-brand-text sm:p-5">{ROW_LABELS[i]}</div>
            <div className="flex items-center justify-center border-x border-brand-border bg-brand-primary/5 p-4 sm:p-5">
              <Check className="h-5 w-5 text-emerald-600" aria-hidden />
              <span className="sr-only">Yes</span>
              <span className="ml-2 hidden text-brand-text sm:inline">{row}</span>
            </div>
            <div className="flex items-center justify-center p-4 text-brand-muted sm:p-5">
              <X className="h-5 w-5 text-red-400" aria-hidden />
              <span className="sr-only">Limited</span>
              <span className="ml-2 hidden sm:inline">{WHY_CHOOSE.others[i]}</span>
            </div>
          </div>
        ))}
      </FadeInView>
    </SectionShell>
  );
}
