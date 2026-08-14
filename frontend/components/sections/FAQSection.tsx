"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/constants";
import { MOTION } from "@/lib/motion";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView } from "@/components/ui/motion";
import type { SiteFaqItem } from "@/lib/site-server";

type Props = {
  items?: SiteFaqItem[];
};

export function FAQSection({ items }: Props) {
  const faqItems = items?.length
    ? items.map((item) => ({ question: item.question, answer: item.answer }))
    : FAQ_ITEMS;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionShell id="faq" className="bg-white" ariaLabel="Frequently asked questions">
      <SectionHeading
        align="left"
        label="FAQ"
        title="Answers,"
        highlight="not fluff."
        description="Pricing, privacy, formats, and commercial use — straight answers."
      />

      <FadeInView className="mt-14" delay={0.05}>
        <div className="border-t border-brand-border">
          {faqItems.map((item, i) => {
            const isOpen = open === i;
            return (
              <article
                key={`${item.question}-${i}`}
                className={`border-b border-brand-border transition-colors ${isOpen ? "bg-brand-bg" : ""}`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="grid w-full grid-cols-[auto_1fr_auto] items-start gap-4 py-6 text-left sm:gap-6 sm:py-7"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-sm font-bold tabular-nums text-brand-ink sm:text-base">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-bold text-brand-text sm:text-xl">
                      {item.question}
                    </span>
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center transition-colors ${
                        isOpen ? "bg-brand-navy text-brand-secondary" : "bg-brand-bg text-brand-muted"
                      }`}
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: MOTION.modal.duration, ease: MOTION.modal.ease }}
                    >
                      <p className="max-w-3xl pb-7 pl-10 text-sm leading-relaxed text-brand-muted sm:pl-14 sm:text-base">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </FadeInView>
    </SectionShell>
  );
}
