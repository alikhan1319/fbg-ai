"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { AI_TOOLS, BRAND } from "@/lib/constants";
import { MOTION } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Sticky site header height */
export const HEADER_H_PX = 90;

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: MOTION.scroll.duration, ease: MOTION.scroll.ease }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-black/[0.06] bg-white/95 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          : "border-transparent bg-white/75 backdrop-blur-lg"
      )}
      style={{ height: HEADER_H_PX }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-secondary/30 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0"
        )}
        aria-hidden
      />

      <nav
        className="relative mx-auto flex h-full max-w-6xl items-center justify-between gap-3 overflow-hidden px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex h-full shrink-0 items-center py-1 transition-opacity duration-200 hover:opacity-90"
        >
          <Image
            src={BRAND.logo}
            alt={`${BRAND.name} logo`}
            width={480}
            height={140}
            quality={100}
            priority
            sizes="(max-width: 640px) 55vw, 300px"
            className="h-[68px] w-auto max-h-[80px] max-w-[min(72vw,280px)] object-contain object-left sm:h-[76px] sm:max-w-[320px]"
          />
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <div className="flex items-center gap-0.5 rounded-full border border-black/[0.06] bg-brand-card/80 p-1 shadow-inner shadow-black/[0.02]">
            {AI_TOOLS.map((t) => {
              const active = pathname === t.route;
              return (
                <Link
                  key={t.id}
                  href={t.route}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white text-brand-secondary shadow-sm ring-1 ring-black/[0.04]"
                      : "text-brand-muted hover:bg-white/70 hover:text-brand-text"
                  )}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/#tools"
            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-muted transition-colors hover:text-brand-secondary"
          >
            All tools
          </Link>
          <Button
            shine
            className="!min-h-[38px] !px-5 !py-2 text-sm"
            onClick={() => router.push("/remove-bg")}
          >
            Start free
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.06] bg-white text-brand-text shadow-sm transition-colors hover:bg-brand-card lg:hidden",
            open && "border-brand-secondary/20 bg-brand-secondary/5 text-brand-secondary"
          )}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
    </motion.header>

    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-navy/30 backdrop-blur-sm lg:hidden"
            style={{ top: HEADER_H_PX }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: MOTION.modal.duration }}
            className="fixed inset-x-0 z-[110] border-b border-black/[0.08] bg-white shadow-2xl lg:hidden"
            style={{
              top: HEADER_H_PX,
              maxHeight: `calc(100dvh - ${HEADER_H_PX}px)`,
            }}
          >
            <div className="overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-muted">
                AI tools
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AI_TOOLS.map((t, i) => {
                  const active = pathname === t.route;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * MOTION.stagger, duration: MOTION.modal.duration }}
                    >
                      <Link
                        href={t.route}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex min-h-[48px] items-center justify-center rounded-xl border px-2 text-center text-sm font-medium transition-colors",
                          active
                            ? "border-brand-secondary/30 bg-brand-secondary/10 text-brand-secondary"
                            : "border-black/[0.06] bg-brand-card/60 text-brand-text"
                        )}
                      >
                        {t.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-5 space-y-2 border-t border-black/[0.06] pt-5">
                <Link
                  href="/#tools"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg py-2.5 text-center text-sm font-medium text-brand-muted hover:text-brand-secondary"
                >
                  Browse all tools
                </Link>
                <Button
                  shine
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    router.push("/remove-bg");
                  }}
                >
                  Start editing free
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
