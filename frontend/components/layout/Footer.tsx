"use client";

import { FormEvent, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { AI_TOOLS, BRAND, SOCIAL_LINKS } from "@/lib/constants";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { subscribeNewsletter } from "@/services/cmsApi";
import { isEmailSubscribedLocally, rememberSubscribedEmail } from "@/lib/newsletter-storage";

const PAGE_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
  { label: "Use cases", href: "/use-cases" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const TRUST_POINTS = ["No signup", "No watermark", "Privacy-first"];

function SocialSvg({
  path,
  className,
  viewBox = "0 0 24 24",
}: {
  path: string;
  className?: string;
  viewBox?: string;
}) {
  return (
    <svg viewBox={viewBox} fill="currentColor" className={className} aria-hidden>
      <path d={path} />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, ReactNode> = {
  Instagram: (
    <SocialSvg
      className="h-4 w-4"
      path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
    />
  ),
  Facebook: (
    <SocialSvg
      className="h-4 w-4"
      path="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
    />
  ),
};

function NavLink({ href, children }: { href: string; children: string }) {
  const cls = "block py-1 text-[15px] text-white/50 transition-colors hover:text-brand-secondary";
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
        {title}
      </p>
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
    <footer className="bg-brand-navy text-white/70" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      <div className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <div className="flex flex-col gap-8 border border-white/10 bg-white/[0.03] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link href="/" className="inline-block shrink-0 transition-opacity hover:opacity-90">
                <Image
                  src={BRAND.logo}
                  alt={`${BRAND.name} logo`}
                  width={480}
                  height={140}
                  quality={100}
                  sizes="(max-width: 640px) 240px, 280px"
                  className="h-14 w-auto max-w-[240px] object-contain sm:h-16"
                />
              </Link>
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {BRAND.shortName}
                </p>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-white/50">
                  {BRAND.tagline}. Six tools, one studio.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 sm:items-end">
              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="text-xs font-medium uppercase tracking-wider text-brand-secondary">
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/remove-bg"
                className="inline-flex min-h-[42px] items-center rounded-md bg-brand-secondary px-5 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-90"
              >
                Start editing free
              </Link>
            </div>
          </div>
        </div>
      </div>

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
              <p className="mt-6 text-sm leading-relaxed text-white/75">
                Questions?{" "}
                <Link href="/contact" className="text-brand-secondary hover:underline">
                  Contact support
                </Link>
                .
              </p>
            </Column>

            <Column title="Connect">
              <p className="text-sm leading-relaxed text-white/75">
                Product updates, tips, and new AI features.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/50 transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                  >
                    {SOCIAL_ICONS[social.label] ?? social.label}
                  </a>
                ))}
              </div>
            </Column>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-display text-lg font-bold text-white">Get editing tips in your inbox</p>
            <p className="mt-1 text-sm text-white/75">Weekly shortcuts — unsubscribe anytime.</p>
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
              className="min-h-[48px] flex-1 rounded-md border border-white/10 bg-transparent px-4 text-sm text-white placeholder:text-white/30 focus:border-brand-secondary focus:outline-none"
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

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-xs text-white/75 sm:flex-row sm:text-left">
        <div className="space-y-2">
          <p>
            © {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="inline-flex flex-wrap items-center justify-center gap-1 sm:justify-start">
            <span>Created with</span>
            <Heart className="h-3.5 w-3.5 fill-brand-secondary text-brand-secondary" aria-hidden />
            <span>by {BRAND.companyName}</span>
          </p>
        </div>
        <p>Family-safe processing · Fair-use free tier</p>
      </div>
    </footer>
  );
}
