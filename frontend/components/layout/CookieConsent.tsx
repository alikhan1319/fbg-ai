"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

type ConsentChoice = "all" | "essential";

const STORAGE_KEY = "fbg-cookie-consent";
const SSR_SENTINEL = "__ssr__";

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
  if (typeof window === "undefined") return SSR_SENTINEL;
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string {
  return SSR_SENTINEL;
}

export function CookieConsent() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const visible = stored === null;

  const save = (choice: ConsentChoice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    emitChange();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[150] border-t border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:p-6"
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-brand-muted">
          We use essential cookies to run the site and optional analytics to improve your experience. See our{" "}
          <Link href="/privacy" className="font-medium text-brand-secondary underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save("essential")}
            className="min-h-[44px] rounded-xl border border-black/10 px-5 py-2.5 text-sm font-semibold text-brand-text transition-colors duration-300 hover:bg-brand-card"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => save("all")}
            className="btn-gradient min-h-[44px] rounded-md px-5 py-2.5 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-95"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
