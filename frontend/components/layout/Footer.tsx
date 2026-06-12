"use client";

import { FormEvent, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { AI_TOOLS, BRAND } from "@/lib/constants";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { subscribeNewsletter } from "@/services/cmsApi";
import { isEmailSubscribedLocally, rememberSubscribedEmail } from "@/lib/newsletter-storage";

const PAGE_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const TRUST_POINTS = [
  { label: "No signup", accent: "text-emerald-400/90" },
  { label: "No watermark", accent: "text-brand-accent/90" },
  { label: "Privacy-first", accent: "text-brand-purple/90" },
];


function NavLink({ href, children }: { href: string; children: string }) {
  const cls =
    "block py-1 text-[15px] text-slate-400 transition-colors hover:text-white";
  if (href.includes("#")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);

  const onNewsletter = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      showToast("Invalid email", "error", "Please enter a valid email address.");
      return;
    }

    if (submitLock.current || submitting) return;

    if (isEmailSubscribedLocally(normalized)) {
      showToast("Already subscribed", "info", "This email is already on our newsletter list.");
      return;
    }

    submitLock.current = true;
    setSubmitting(true);

    try {
      const result = await subscribeNewsletter(normalized, "Footer");

      if (result.status === "exists") {
        rememberSubscribedEmail(normalized);
        showToast(
          "Already subscribed",
          "info",
          "You're already on our list — no duplicate signup was saved."
        );
      } else {
        rememberSubscribedEmail(normalized);
        setEmail("");
        showToast(
          "Successfully subscribed!",
          "success",
          "Thanks for joining! Weekly AI editing tips are on the way."
        );
      }
    } catch (err) {
      showToast(
        "Subscription failed",
        "error",
        err instanceof Error ? err.message : "Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  return (
    <footer className="bg-brand-navy text-slate-300" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      {/* ——— Band 1: Brand (compact) ——— */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-9">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-brand-secondary/5 px-5 py-6 sm:px-7 sm:py-7">
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-secondary/20 blur-2xl"
              aria-hidden
            />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
                <Link
                  href="/"
                  className="inline-block shrink-0 transition-opacity duration-200 hover:opacity-90"
                >
                  <span className="inline-block rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
                    <Image
                      src={BRAND.logo}
                      alt={`${BRAND.name} logo`}
                      width={480}
                      height={140}
                      quality={100}
                      sizes="(max-width: 640px) 280px, 340px"
                      className="h-16 w-auto max-w-[min(100%,280px)] object-contain sm:h-20 sm:max-w-[320px] md:h-24"
                    />
                  </span>
                </Link>
                <div className="text-center sm:text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                    Free AI image studio
                  </p>
                  <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-400">
                    {BRAND.tagline}. Six tools, one workspace — built for creators.
                  </p>
                  <Link
                    href="/remove-bg"
                    className="mt-3 inline-flex min-h-[40px] items-center rounded-lg bg-brand-secondary px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Start editing free
                  </Link>
                </div>
              </div>

              <ul className="flex flex-wrap justify-center gap-2 sm:max-w-[220px] sm:justify-end">
                {TRUST_POINTS.map((point) => (
                  <li
                    key={point.label}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-brand-navy/50 px-2.5 py-1.5"
                  >
                    <svg
                      className={`h-3.5 w-3.5 shrink-0 ${point.accent}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium text-slate-300">{point.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ——— Band 2: Four separate link columns ——— */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <Column title="AI tools">
              <ul className="space-y-1">
                {AI_TOOLS.map((tool) => (
                  <li key={tool.id}>
                    <NavLink href={tool.route}>{tool.fullName}</NavLink>
                  </li>
                ))}
              </ul>
            </Column>

            <Column title="Pages">
              <ul className="space-y-1">
                {PAGE_LINKS.map((link) => (
                  <li key={link.label}>
                    <NavLink href={link.href}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </Column>

            <Column title="Legal">
              <ul className="space-y-1">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <NavLink href={link.href}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </Column>

            <Column title="Connect">
              <p className="text-sm leading-relaxed text-slate-500">
                Product updates, tips, and new AI features.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="#"
                  aria-label="X (Twitter)"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/25 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/25 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.881 0 1.44 1.44 0 012.881 0z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/25 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </Column>
          </div>
        </div>
      </div>

      {/* ——— Band 3: Newsletter (own row, nothing else) ——— */}
      <div className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-base font-semibold text-white">Get editing tips in your inbox</p>
            <p className="mt-1 text-sm text-slate-500">Weekly shortcuts — unsubscribe anytime.</p>
          </div>
          <form
            onSubmit={onNewsletter}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-h-[48px] flex-1 rounded-xl border border-white/10 bg-brand-navy px-4 text-sm text-white placeholder:text-slate-600 focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/30"
            />
            <Button
              type="submit"
              shine
              disabled={submitting}
              className="min-h-[48px] w-full shrink-0 px-8 sm:w-auto disabled:opacity-60"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>

      {/* ——— Band 4: Copyright ——— */}
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
        <div className="space-y-2">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="inline-flex flex-wrap items-center justify-center gap-1 sm:justify-start">
            <span>Created with</span>
            <Heart
              className="h-3.5 w-3.5 fill-rose-500 text-rose-500"
              aria-hidden
            />
            <span>by {BRAND.companyName}</span>
          </p>
        </div>
        <p>Family-safe processing · Fair-use free tier</p>
      </div>
    </footer>
  );
}
