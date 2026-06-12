"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";

const MIN_VISIBLE_MS = 1200;
const MAX_VISIBLE_MS = 5000;

export function SiteLoader() {
  const pathname = usePathname();
  const skip = pathname.startsWith("/admin");
  const [visible, setVisible] = useState(!skip);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (skip) return;

    const start = Date.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(() => setVisible(false), wait);
    };

    const progressTimer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 92) return value;
        return value + Math.random() * 12;
      });
    }, 180);

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    const maxTimer = window.setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", finish);
    };
  }, [skip]);

  useEffect(() => {
    if (!visible || skip) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible, skip]);

  useEffect(() => {
    if (visible) return;
    setProgress(100);
  }, [visible]);

  if (skip) return null;

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key="site-loader"
          className="site-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
          aria-busy="true"
          role="status"
        >
          <div className="site-loader__mesh" aria-hidden />
          <div className="site-loader__grid hero-grid-dots opacity-40" aria-hidden />

          <motion.div
            className="site-loader__orb site-loader__orb--blue"
            animate={{ x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.div
            className="site-loader__orb site-loader__orb--purple"
            animate={{ x: [0, -20, 0], y: [0, 22, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            aria-hidden
          />

          <div className="site-loader__content">
            <motion.div
              className="site-loader__logo-wrap"
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="site-loader__ring" aria-hidden />
              <div className="site-loader__ring site-loader__ring--inner" aria-hidden />
              <Image
                src={BRAND.logo}
                alt=""
                width={72}
                height={72}
                className="site-loader__logo"
                priority
              />
            </motion.div>

            <motion.p
              className="site-loader__brand gradient-text-animated"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {BRAND.shortName}
            </motion.p>

            <motion.p
              className="site-loader__tagline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
            >
              {BRAND.tagline}
            </motion.p>

            <div className="site-loader__bar-track" aria-hidden>
              <motion.div
                className="site-loader__bar-fill"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ ease: "easeOut", duration: 0.35 }}
              />
            </div>

            <motion.p
              className="site-loader__hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              transition={{ delay: 0.5, duration: 2.2, repeat: Infinity }}
            >
              Loading AI tools…
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
