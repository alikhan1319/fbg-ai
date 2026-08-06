"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calendar, Clock } from "lucide-react";
import type { CmsBlogPost } from "@/lib/cms-server";
import { isUploadedBlogImage, resolveBlogImage } from "@/lib/media-url";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView } from "@/components/ui/motion";
import { fetchBlogPosts } from "@/services/cmsApi";

export function BlogSection({ posts }: { posts: CmsBlogPost[] }) {
  const [livePosts, setLivePosts] = useState(posts);

  const refreshPosts = useCallback(async () => {
    try {
      const data = await fetchBlogPosts(1, 3);
      if (data?.posts) setLivePosts(data.posts);
    } catch {
      // Keep server-rendered data if the live refresh fails.
    }
  }, []);

  useEffect(() => {
    setLivePosts(posts);
  }, [posts]);

  useEffect(() => {
    void refreshPosts();
  }, [refreshPosts]);

  useEffect(() => {
    const onFocus = () => {
      void refreshPosts();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshPosts]);

  if (livePosts.length === 0) return null;

  const [featured, ...rest] = livePosts;

  return (
    <SectionShell id="blog" className="bg-brand-bg" ariaLabel="Blog and resources">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          align="left"
          className="max-w-xl"
          label="Resources"
          title="Learn the craft."
          highlight="Ship faster."
          description="Guides and tips for sharper AI image editing workflows."
        />
        <FadeInView>
          <Link
            href="/blog"
            className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-secondary"
          >
            All articles
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </FadeInView>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
        {featured && (
          <FadeInView className="lg:col-span-7">
            <Link
              href={`/blog/${featured.slug}`}
              className="group flex h-full flex-col overflow-hidden border border-brand-border bg-white transition-colors hover:border-brand-navy"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-brand-card">
                <Image
                  src={resolveBlogImage(featured.image)}
                  alt={featured.imageAlt}
                  fill
                  unoptimized={isUploadedBlogImage(featured.image)}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <span className="absolute left-4 top-4 bg-brand-navy px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
                  {featured.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    {featured.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {featured.readTime}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold leading-snug text-brand-text transition-colors group-hover:text-brand-secondary sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted sm:text-base">
                  {featured.excerpt}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </FadeInView>
        )}

        <div className="flex flex-col gap-4 lg:col-span-5">
          {rest.map((post, i) => (
            <FadeInView key={post.slug} delay={0.08 * (i + 1)}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-[1fr_auto] gap-4 border border-brand-border bg-white p-4 transition-colors hover:border-brand-navy hover:bg-brand-navy sm:gap-5 sm:p-5"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
                    {post.category}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug text-brand-text transition-colors group-hover:text-white">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-brand-muted transition-colors group-hover:text-white/50">
                    {post.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-brand-muted transition-colors group-hover:text-white/35">
                    {post.date} · {post.readTime}
                  </p>
                </div>
                <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden bg-brand-card sm:block">
                  <Image
                    src={resolveBlogImage(post.image)}
                    alt=""
                    fill
                    unoptimized={isUploadedBlogImage(post.image)}
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </Link>
            </FadeInView>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
