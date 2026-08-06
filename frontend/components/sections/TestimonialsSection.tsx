"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { MOTION } from "@/lib/motion";
import { TestimonialAvatar } from "@/lib/testimonial-avatar";
import type { SiteTestimonial } from "@/lib/site-server";

type Props = {
  items?: SiteTestimonial[];
};

export function TestimonialsSection({ items }: Props) {
  const testimonials = items?.length
    ? items.map((item) => ({
        name: item.name,
        role: item.role,
        company: item.company,
        quote: item.quote,
      }))
    : TESTIMONIALS.map((item) => ({
        name: item.name,
        role: item.role,
        company: item.company,
        quote: item.quote,
      }));
  const [index, setIndex] = useState(0);
  const total = testimonials.length || 1;

  useEffect(() => {
    if (total <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 7000);
    return () => clearInterval(id);
  }, [total]);

  const t = testimonials[index] || testimonials[0];

  return (
    <SectionShell id="testimonials" className="bg-brand-bg" ariaLabel="Customer testimonials">
      <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:items-start">
        <div>
          <SectionHeading
            align="left"
            label="Social proof"
            title="Trusted by"
            highlight="creators"
            description="Designers, sellers, and marketers rely on FBG AI for fast, professional image edits."
          />
          <div className="mt-8 inline-flex items-center gap-2 border border-brand-border bg-white px-4 py-2.5 text-sm">
            <div className="flex gap-0.5 text-brand-secondary" aria-hidden>
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="font-semibold text-brand-text">4.9 Trustpilot</span>
          </div>
        </div>

        {t ? (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={t.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: MOTION.scroll.duration, ease: MOTION.scroll.ease }}
                className="relative bg-brand-navy p-8 text-white sm:p-12"
              >
                <span
                  className="pointer-events-none absolute right-6 top-4 font-display text-[7rem] leading-none text-brand-secondary/20 sm:right-10 sm:text-[9rem]"
                  aria-hidden
                >
                  ”
                </span>
                <p className="relative font-display text-2xl leading-snug tracking-tight sm:text-3xl lg:text-[2.15rem] lg:leading-[1.25]">
                  {t.quote}
                </p>
                <footer className="relative mt-10 flex items-center gap-4 border-t border-white/10 pt-8">
                  <TestimonialAvatar name={t.name} />
                  <div>
                    <cite className="not-italic font-bold text-white">{t.name}</cite>
                    {(t.role || t.company) && (
                      <p className="text-sm text-white/45">
                        {[t.role, t.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            {total > 1 ? (
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => setIndex((i) => (i - 1 + total) % total)}
                  className="flex h-11 w-11 items-center justify-center border border-brand-border bg-white text-brand-text transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => setIndex((i) => (i + 1) % total)}
                  className="flex h-11 w-11 items-center justify-center border border-brand-border bg-white text-brand-text transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <span className="ml-2 font-display text-sm font-bold tabular-nums text-brand-muted">
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
