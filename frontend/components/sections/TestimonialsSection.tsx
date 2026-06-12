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
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 6000);
    return () => clearInterval(id);
  }, [total]);

  const t = testimonials[index] || testimonials[0];

  return (
    <SectionShell id="testimonials" ariaLabel="Customer testimonials">
      <SectionHeading
        label="Social proof"
        title="Trusted by"
        highlight="150,000+ creators"
        description="Designers, sellers, and marketers rely on FBG AI for fast, professional image edits."
      />

      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm shadow-sm">
          <div className="flex gap-0.5 text-amber-400" aria-hidden>
            {Array.from({ length: 5 }).map((_, j) => (
              <Star key={j} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <span className="font-semibold text-brand-text">Rated 4.9 on Trustpilot</span>
        </div>
      </div>

      {t ? (
        <>
          <div className="relative mx-auto mt-12 max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={t.name}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: MOTION.scroll.duration, ease: MOTION.scroll.ease }}
                className="luxury-card rounded-3xl p-8 sm:p-10"
              >
                <p className="text-lg leading-relaxed text-brand-text sm:text-xl">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-8 flex items-center gap-4">
                  <TestimonialAvatar name={t.name} />
                  <div>
                    <cite className="not-italic font-bold text-brand-text">{t.name}</cite>
                    {(t.role || t.company) && (
                      <p className="text-sm text-brand-muted">
                        {[t.role, t.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </footer>              </motion.blockquote>
            </AnimatePresence>

            {total > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => setIndex((i) => (i - 1 + total) % total)}
                  className="rounded-full border border-brand-border p-2 text-brand-muted hover:text-brand-secondary"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((item, i) => (
                    <button
                      key={item.name}
                      type="button"
                      aria-label={`Show testimonial ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-brand-secondary" : "w-2 bg-brand-border"}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => setIndex((i) => (i + 1) % total)}
                  className="rounded-full border border-brand-border p-2 text-brand-muted hover:text-brand-secondary"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {testimonials.slice(0, 3).map((item) => (
              <div key={item.name} className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
                <p className="text-sm leading-relaxed text-brand-muted">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <TestimonialAvatar name={item.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-brand-text">{item.name}</p>
                    {item.role ? <p className="text-xs text-brand-muted">{item.role}</p> : null}
                  </div>
                </div>
              </div>
            ))}          </div>
        </>
      ) : null}
    </SectionShell>
  );
}
