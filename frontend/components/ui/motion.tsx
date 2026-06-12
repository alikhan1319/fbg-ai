"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp, MOTION, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FadeInViewProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeInView({ children, className, delay = 0, ...props }: FadeInViewProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: fadeInUp.hidden,
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: MOTION.scroll.duration,
            ease: [...MOTION.scroll.ease],
            delay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className,
  as: Component = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ol" | "ul";
}) {
  const components = { div: motion.div, ol: motion.ol, ul: motion.ul } as const;
  const MotionComponent = components[Component];
  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

export function StaggerGridItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

export function PremiumCard({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      }}
      className={cn(
        "luxury-card group relative overflow-hidden rounded-2xl border border-brand-border/80 bg-white p-6",
        glow && "luxury-card-glow",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-secondary/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-brand-accent/10 blur-2xl" />
      </div>
      <div className="relative">{children}</div>
    </motion.div>
  );
}
