"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: Variant;
  shine?: boolean;
  children?: React.ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "btn-gradient text-brand-navy",
  secondary:
    "bg-white text-brand-text border border-brand-border hover:border-brand-text/30",
  ghost: "text-brand-text hover:bg-brand-card",
  outline:
    "border border-brand-text/20 text-brand-text hover:border-brand-secondary hover:text-brand-secondary",
};

export function Button({
  className,
  variant = "primary",
  shine = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "btn-ripple inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 disabled:opacity-50",
        variants[variant],
        shine && variant === "primary" && "btn-shine",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
