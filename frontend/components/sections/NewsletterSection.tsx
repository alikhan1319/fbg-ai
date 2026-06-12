"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView } from "@/components/ui/motion";
import { Button } from "@/components/ui/Button";

export function NewsletterSection() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      showToast("Thanks! You're subscribed to FBG AI updates.");
    }, 800);
  };

  return (
    <SectionShell className="bg-brand-card/50" ariaLabel="Newsletter signup">
      <div className="section-divider absolute inset-x-0 top-0" />
      <FadeInView className="mx-auto max-w-2xl">
        <div className="animated-border shadow-xl">
          <div className="animated-border-inner p-8 text-center sm:p-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-secondary to-brand-purple text-white shadow-lg"
            >
              <Mail className="h-7 w-7" />
            </motion.div>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-brand-text sm:text-3xl">
              Get AI editing tips in your <span className="gradient-text-animated">inbox</span>
            </h2>
            <p className="mt-3 text-brand-muted/90">
              Monthly guides, tool updates, and workflow tips. No spam — unsubscribe anytime.
            </p>
            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-h-[44px] flex-1 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
              />
              <Button type="submit" shine disabled={loading} className="sm:shrink-0">
                {loading ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </FadeInView>
    </SectionShell>
  );
}
