"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getBlogPageHref } from "@/lib/blog";
import { cn } from "@/lib/utils";

export function BlogPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-12 flex flex-col items-center gap-4 sm:mt-14"
    >
      <p className="text-sm text-brand-muted">
        Page <span className="font-semibold text-brand-text">{page}</span> of{" "}
        <span className="font-semibold text-brand-text">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={getBlogPageHref(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            "inline-flex h-10 min-w-[40px] items-center justify-center gap-1 rounded-xl border px-3 text-sm font-semibold transition-all",
            page <= 1
              ? "pointer-events-none border-brand-border/50 text-brand-muted/40"
              : "border-brand-border bg-white text-brand-text shadow-sm hover:border-brand-secondary/40 hover:text-brand-secondary"
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Prev</span>
        </Link>

        {pages.map((p) => (
          <Link
            key={p}
            href={getBlogPageHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-all",
              p === page
                ? "border-brand-secondary bg-brand-secondary text-white shadow-md shadow-brand-secondary/25"
                : "border-brand-border bg-white text-brand-text shadow-sm hover:border-brand-secondary/40 hover:text-brand-secondary"
            )}
          >
            {p}
          </Link>
        ))}

        <Link
          href={getBlogPageHref(page + 1)}
          aria-disabled={page >= totalPages}
          className={cn(
            "inline-flex h-10 min-w-[40px] items-center justify-center gap-1 rounded-xl border px-3 text-sm font-semibold transition-all",
            page >= totalPages
              ? "pointer-events-none border-brand-border/50 text-brand-muted/40"
              : "border-brand-border bg-white text-brand-text shadow-sm hover:border-brand-secondary/40 hover:text-brand-secondary"
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
