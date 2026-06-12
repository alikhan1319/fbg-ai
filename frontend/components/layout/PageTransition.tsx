"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  adminPageVariants,
  pageVariants,
  pageVariantsReduced,
} from "@/lib/motion";

function NavigationProgress({ active }: { active: boolean }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-[3px] overflow-hidden"
      aria-hidden
    >
      <AnimatePresence>
        {active ? (
          <motion.div
            key="nav-progress"
            className="page-nav-progress"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.2, delay: 0.15 },
            }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isAdmin = pathname.startsWith("/admin");
  const [progress, setProgress] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setProgress(true);
    const timer = window.setTimeout(() => setProgress(false), 650);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const variants = reduceMotion
    ? pageVariantsReduced
    : isAdmin
      ? adminPageVariants
      : pageVariants;

  return (
    <>
      <NavigationProgress active={progress} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          className="min-h-[inherit] will-change-[opacity]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
