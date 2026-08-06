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
export const HEADER_H_PX = 72;

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
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: MOTION.scroll.duration, ease: MOTION.scroll.ease }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
          scrolled
            ? "border-white/10 bg-brand-navy/95 backdrop-blur-md"
            : "border-transparent bg-brand-navy/80 backdrop-blur-sm"
        )}
        style={{ height: HEADER_H_PX }}
      >
        <nav
          className="relative mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
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
              sizes="(max-width: 640px) 55vw, 260px"
              className="h-[48px] w-auto max-w-[min(70vw,240px)] object-contain object-left sm:h-[52px] sm:max-w-[280px]"
            />
          </Link>

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="flex items-center gap-1">
              {AI_TOOLS.map((t) => {
                const active = pathname === t.route;
                return (
                  <Link
                    key={t.id}
                    href={t.route}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors duration-200",
                      active
                        ? "text-brand-secondary"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {t.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Button
              shine
              className="!min-h-[38px] !rounded-md !px-5 !py-2 text-sm"
              onClick={() => router.push("/remove-bg")}
            >
              Start free
            </Button>
          </div>

          <button
            type="button"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white transition-colors hover:bg-white/10 lg:hidden",
              open && "border-brand-secondary/40 bg-brand-secondary/10 text-brand-secondary"
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
              className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-sm lg:hidden"
              style={{ top: HEADER_H_PX }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: MOTION.modal.duration }}
              className="fixed inset-x-0 z-[110] border-b border-white/10 bg-brand-navy lg:hidden"
              style={{
                top: HEADER_H_PX,
                maxHeight: `calc(100dvh - ${HEADER_H_PX}px)`,
              }}
            >
              <div className="overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-secondary">
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
                            "flex min-h-[48px] items-center justify-center rounded-md border px-2 text-center text-sm font-medium transition-colors",
                            active
                              ? "border-brand-secondary/40 bg-brand-secondary/15 text-brand-secondary"
                              : "border-white/10 bg-white/5 text-white/80"
                          )}
                        >
                          {t.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="block rounded-md py-2.5 text-center text-sm font-medium text-white/55 hover:text-white"
                  >
                    Home
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
