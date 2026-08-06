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
  light?: boolean;
}

export function SectionHeading({
  label,
  title,
  highlight,
  description,
  align = "center",
  className,
  light = false,
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
        <span
          className={cn(
            "studio-label",
            align === "center" && "mx-auto",
            light && "text-brand-secondary"
          )}
        >
          {label}
        </span>
      )}
      <h2
        className={cn(
          "mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]",
          light ? "text-white" : "text-brand-text"
        )}
      >
        {title}{" "}
        {highlight && <span className="text-brand-secondary">{highlight}</span>}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg max-w-2xl",
            align === "center" && "mx-auto",
            light ? "text-white/65" : "text-brand-muted"
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
      className={cn("relative overflow-x-clip py-20 sm:py-28", className)}
    >
      <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-8">{children}</div>
    </section>
  );
}
