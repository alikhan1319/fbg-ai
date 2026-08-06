"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Crumb = { label: string; href?: string };

export function StudioPageHero({
  crumbs,
  label,
  title,
  description,
  actions,
  dark = true,
  children,
  className,
}: {
  crumbs?: Crumb[];
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  dark?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden pt-24 pb-14 sm:pt-28 sm:pb-16",
        dark ? "bg-brand-navy" : "bg-brand-bg",
        className
      )}
      aria-label="Page hero"
    >
      {dark && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 20%, rgba(0,191,166,0.16), transparent 55%)",
          }}
        />
      )}
      <div className="relative mx-auto w-full max-w-[1200px] px-6 sm:px-8">
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className={cn(
              "mb-8 flex flex-wrap items-center gap-2 text-sm",
              dark ? "text-white/45" : "text-brand-muted"
            )}
          >
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="inline-flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />}
                {c.href ? (
                  <Link
                    href={c.href}
                    className={cn(
                      "font-medium transition-colors",
                      dark ? "hover:text-brand-secondary" : "hover:text-brand-secondary"
                    )}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className={cn("font-semibold", dark ? "text-white" : "text-brand-text")}>
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {label && <p className="studio-label">{label}</p>}
        <h1
          className={cn(
            "mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]",
            dark ? "text-white" : "text-brand-text"
          )}
        >
          {title}
        </h1>
        {description && (
          <div
            className={cn(
              "mt-5 max-w-2xl text-base leading-relaxed sm:text-lg",
              dark ? "text-white/60" : "text-brand-muted"
            )}
          >
            {description}
          </div>
        )}
        {actions && <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>}
        {children}
      </div>
    </section>
  );
}
