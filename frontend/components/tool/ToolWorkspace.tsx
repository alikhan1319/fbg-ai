"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Dark studio band that wraps tool upload UIs */
export function ToolWorkspace({
  children,
  className,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id="upload"
      aria-label="Upload workspace"
      className={cn("relative overflow-hidden bg-brand-navy py-14 sm:py-16", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 20% 10%, rgba(0,191,166,0.12), transparent 55%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-6 sm:px-8">
        <div
          className={cn(
            "grid gap-8",
            aside ? "lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-10" : "mx-auto max-w-3xl"
          )}
        >
          <div>{children}</div>
          {aside ? <aside className="lg:sticky lg:top-28">{aside}</aside> : null}
        </div>
      </div>
    </section>
  );
}

export function ToolDropzoneFrame({
  children,
  active,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-white/12 bg-white/[0.04] transition-colors",
        active && "border-brand-secondary",
        className
      )}
    >
      {children}
    </div>
  );
}
