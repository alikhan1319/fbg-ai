"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/constants";
import type { CmsBlogPost } from "@/lib/cms-server";
import { isUploadedBlogImage, resolveBlogImage } from "@/lib/media-url";
import { cn } from "@/lib/utils";

export function BlogPostCard({
  post,
  showCategory = false,
}: {
  post: BlogPost | CmsBlogPost;
  showCategory?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-brand-border bg-white transition-colors hover:border-brand-text/25">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/10] shrink-0 overflow-hidden bg-brand-card"
      >
        <Image
          src={resolveBlogImage(post.image)}
          alt={post.imageAlt}
          fill
          unoptimized={isUploadedBlogImage(post.image)}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span
          className={cn(
            "absolute left-3 top-3 bg-brand-navy px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-secondary",
            !showCategory && "sr-only"
          )}
        >
          {post.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
          {!showCategory && (
            <span className="font-semibold uppercase tracking-wider text-brand-secondary">
              {post.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {post.date}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {post.readTime}
          </span>
        </div>

        <h3 className="mt-3 font-display text-lg font-bold leading-snug text-brand-text transition-colors duration-300 group-hover:text-brand-secondary">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{post.excerpt}</p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary transition-all duration-300 group-hover:gap-2"
        >
          Read article
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
