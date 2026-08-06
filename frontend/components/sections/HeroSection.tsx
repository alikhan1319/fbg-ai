"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { pageLoadContainer, pageLoadItem } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { UploadHeroCard } from "@/components/ui/UploadHeroCard";

export function HeroSection() {
  return (
    <section
      className="hero-studio relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-20 pb-16 sm:pt-24"
      aria-label="Hero"
    >
      <div className="hero-studio-grain absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 70% 40%, rgba(0,191,166,0.12), transparent 55%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            variants={pageLoadContainer}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.h1 variants={pageLoadItem} className="hero-headline text-white">
              Free Background Remover AI
              <span className="mt-1 block text-brand-secondary">Keep the subject.</span>
            </motion.h1>

            <motion.div
              variants={pageLoadItem}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                shine
                className="btn-gradient btn-shine min-h-[48px] w-full sm:w-auto"
                onClick={() =>
                  document.getElementById("hero-upload")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Try free now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="min-h-[48px] w-full border-white/25 text-white hover:border-brand-secondary hover:bg-transparent hover:text-brand-secondary sm:w-auto"
                onClick={() =>
                  document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore tools
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-px rounded-lg bg-gradient-to-br from-brand-secondary/40 via-white/10 to-transparent opacity-60" aria-hidden />
              <UploadHeroCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
