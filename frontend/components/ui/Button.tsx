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
  primary: "btn-gradient text-white shadow-lg shadow-brand-secondary/25 hover:shadow-brand-purple/30",
  secondary:
    "bg-white text-brand-text border border-black/5 hover:border-brand-secondary/40 hover:shadow-md",
  ghost: "text-brand-text hover:bg-brand-card",
  outline:
    "border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white",
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "btn-ripple inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 disabled:opacity-50",
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
