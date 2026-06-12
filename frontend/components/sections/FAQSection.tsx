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
    <SectionShell id="faq" className="bg-brand-card" ariaLabel="Frequently asked questions">
      <div className="section-divider absolute inset-x-0 top-0" />
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <SectionHeading
          align="left"
          label="FAQ"
          title="Common"
          highlight="questions"
          description="Answers about pricing, privacy, formats, and commercial use."
        />

        <FadeInView className="space-y-3" delay={0.1}>
          {faqItems.map((item, i) => {
            const isOpen = open === i;
            return (
              <article
                key={`${item.question}-${i}`}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                  isOpen ? "border-brand-secondary/40 shadow-lg luxury-card" : "border-brand-border"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors duration-300 hover:bg-brand-card/30"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-brand-text">{item.question}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen ? "bg-brand-primary text-white shadow-md" : "bg-brand-card text-brand-muted"
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
                      <p className="border-t border-brand-border px-5 pb-5 pt-3 text-sm leading-relaxed text-brand-muted">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </FadeInView>
      </div>
    </SectionShell>
  );
}
