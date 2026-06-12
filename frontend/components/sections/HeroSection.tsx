"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { pageLoadContainer, pageLoadItem } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { HeroParticles } from "@/components/ui/HeroParticles";
import { UploadHeroCard } from "@/components/ui/UploadHeroCard";
import { BRAND } from "@/lib/constants";
import { PRIMARY_KEYWORD_TITLE } from "@/lib/seo";

const TRUST_LOGOS = ["Shopify", "Etsy", "Amazon", "Canva", "Adobe"];

export function HeroSection() {
  return (
    <section
      className="hero-mesh hero-grid-dots relative flex min-h-[90vh] flex-col justify-center overflow-hidden pt-24 pb-16 sm:pt-28"
      aria-label="Hero"
    >
      <HeroParticles />
      <motion.div
        className="gradient-orb pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-secondary to-brand-purple"
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-brand-accent/30 blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 bottom-40 h-64 w-64 rounded-full bg-brand-purple/25 blur-3xl"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 9, repeat: Infinity, delay: 1 }}
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-8">
        <motion.div
          variants={pageLoadContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.span
            variants={pageLoadItem}
            className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-semibold text-brand-secondary shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
            {BRAND.tagline}
          </motion.span>

          <motion.h1 variants={pageLoadItem} className="hero-headline mt-6 text-brand-text">
            {PRIMARY_KEYWORD_TITLE} —{" "}
            <span className="gradient-text-animated">Remove Backgrounds in One Click</span>
          </motion.h1>

          <motion.p variants={pageLoadItem} className="hero-subhead mx-auto mt-6 text-brand-muted">
            The best free background remover AI for creators and shops — cut out subjects, export
            transparent PNGs, then upscale, enhance, blur, remove watermarks, or generate new
            backgrounds. No signup required.
          </motion.p>

          <motion.div
            variants={pageLoadItem}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              shine
              className="btn-gradient btn-ripple min-h-[44px] w-full sm:w-auto"
              onClick={() => document.getElementById("hero-upload")?.scrollIntoView({ behavior: "smooth" })}
            >
              Try Free Now
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="min-h-[44px] w-full sm:w-auto"
              onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Tools
            </Button>
          </motion.div>

          <motion.div variants={pageLoadItem} className="mt-12">
            <p className="text-sm font-medium text-brand-muted">
              Trusted by <span className="font-bold text-brand-text">50,000+</span> creators
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 opacity-60">
              {TRUST_LOGOS.map((name) => (
                <span
                  key={name}
                  className="text-xs font-bold uppercase tracking-widest text-brand-text/70 sm:text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-14 lg:mt-16">
          <UploadHeroCard />
        </div>

        <motion.a
          href="#tools"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="animate-bounce-down mt-12 flex justify-center text-brand-muted transition-colors hover:text-brand-secondary"
          aria-label="Scroll to tools"
        >
          <ChevronDown className="h-8 w-8" />
        </motion.a>
      </div>
    </section>
  );
}
