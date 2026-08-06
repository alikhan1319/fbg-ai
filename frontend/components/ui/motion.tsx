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
        y: -2,
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
      }}
      className={cn(
        "group relative overflow-hidden border border-brand-border bg-white p-6 transition-colors hover:border-brand-text/20",
        glow && "border-brand-secondary/30",
        className
      )}
    >
      <div className="relative">{children}</div>
    </motion.div>
  );
}
