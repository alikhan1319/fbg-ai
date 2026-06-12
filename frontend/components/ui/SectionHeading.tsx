"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  label?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  highlight,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUp}
      className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}
    >
      {label && (
        <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-secondary shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-purple animate-pulse" />
          {label}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}{" "}
        {highlight && <span className="gradient-text-animated">{highlight}</span>}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-brand-muted/90 sm:text-lg max-w-2xl",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}

export function SectionShell({
  id,
  children,
  className,
  ariaLabel,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn("relative overflow-x-clip py-16 sm:py-24", className)}
    >
      <div className="mx-auto w-full max-w-[1280px] px-8">{children}</div>
    </section>
  );
}
