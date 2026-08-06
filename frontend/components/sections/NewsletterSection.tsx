"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
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
    <section aria-label="Newsletter signup" className="bg-brand-bg py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <FadeInView className="grid overflow-hidden border border-brand-border lg:grid-cols-2">
          <div className="bg-brand-navy p-8 text-white sm:p-12 lg:p-14">
            <p className="studio-label">Stay sharp</p>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Editing tips in your{" "}
              <span className="text-brand-secondary">inbox</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
              Monthly guides, tool updates, and workflow tips. No spam — unsubscribe anytime.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/45">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 bg-brand-secondary" aria-hidden />
                New tool releases first
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 bg-brand-secondary" aria-hidden />
                Practical edit workflows
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 bg-brand-secondary" aria-hidden />
                One email a month max
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center bg-white p-8 sm:p-12 lg:p-14">
            <div className="mb-6 flex h-12 w-12 items-center justify-center bg-brand-secondary text-brand-navy">
              <Mail className="h-5 w-5" />
            </div>
            <p className="font-display text-xl font-bold text-brand-text">Join the list</p>
            <p className="mt-2 text-sm text-brand-muted">Drop your email — we&apos;ll take it from there.</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-3">
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
                className="min-h-[48px] w-full border border-brand-border bg-brand-bg px-4 py-3 text-sm outline-none transition-colors placeholder:text-brand-muted/60 focus:border-brand-secondary"
              />
              <Button type="submit" shine disabled={loading} className="w-full min-h-[48px]">
                {loading ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
