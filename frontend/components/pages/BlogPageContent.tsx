"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, BookOpen } from "lucide-react";
import { fetchBlogPosts } from "@/services/cmsApi";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { BlogPostCard } from "@/components/ui/BlogPostCard";
import { BlogPagination } from "@/components/ui/BlogPagination";
import { BRAND } from "@/lib/constants";
import type { CmsBlogPost } from "@/lib/cms-server";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";

export function BlogPageContent({
  posts = [],
  page = 1,
  totalPages = 1,
  totalPosts = 0,
}: {
  posts?: readonly CmsBlogPost[];
  page?: number;
  totalPages?: number;
  totalPosts?: number;
}) {
  const [livePosts, setLivePosts] = useState<CmsBlogPost[]>(posts ?? []);
  const [livePage, setLivePage] = useState(page);
  const [liveTotalPages, setLiveTotalPages] = useState(totalPages);
  const [liveTotalPosts, setLiveTotalPosts] = useState(totalPosts);

  const refreshPosts = useCallback(async () => {
    try {
      const data = await fetchBlogPosts(page, 12);
      if (data?.posts) {
        setLivePosts(data.posts);
        setLivePage(data.page ?? page);
        setLiveTotalPages(data.totalPages ?? 1);
        setLiveTotalPosts(data.totalPosts ?? data.posts.length);
      }
    } catch {
      // Keep server-rendered data if the live refresh fails.
    }
  }, [page]);

  useEffect(() => {
    setLivePosts(posts ?? []);
    setLivePage(page);
    setLiveTotalPages(totalPages);
    setLiveTotalPosts(totalPosts);
  }, [posts, page, totalPages, totalPosts]);

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

  const safePosts = livePosts ?? [];
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <section className="hero-mesh hero-grid-dots relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-purple/15 blur-3xl" aria-hidden />
          <div className="relative mx-auto w-full max-w-[1280px] px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
              <Link href="/" className="font-medium transition-colors hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <span className="font-semibold text-brand-text">Blog</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-secondary shadow-sm">
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                Resources & guides
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl">
                {PRIMARY_KEYWORD_TITLE}{" "}
                <span className="gradient-text-animated">Blog</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-brand-muted">
                Guides, tips, and workflows for our{" "}
                <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                  {PRIMARY_KEYWORD}
                </Link>
                , upscaler, enhancer, and the rest of our free tools on the{" "}
                <Link href="/" className="font-semibold text-brand-secondary hover:underline">
                  homepage
                </Link>
                .
              </p>
            </motion.div>
          </div>
        </section>

        <SectionShell ariaLabel="Blog articles">
          <SectionHeading
            label="Latest articles"
            title="Learn &"
            highlight="grow"
            description={`Practical advice for creators, sellers, and teams — ${liveTotalPosts} guides across ${liveTotalPages} page${liveTotalPages === 1 ? "" : "s"}.`}
          />

          <StaggerGrid className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {safePosts.map((post) => (
              <StaggerGridItem key={post.slug}>
                <BlogPostCard post={post} showCategory />
              </StaggerGridItem>
            ))}
          </StaggerGrid>

          <BlogPagination page={livePage} totalPages={liveTotalPages} />

          <FadeInView className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-brand-navy px-8 py-12 text-center shadow-2xl sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-secondary/20 via-transparent to-brand-purple/20" aria-hidden />
            <div className="relative">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready to try what you learned?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
                Put these guides into action with {BRAND.name} — start on our remove background tool or explore all six
                free AI editors.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/remove-bg"
                  className="btn-ripple btn-gradient btn-shine inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg sm:w-auto"
                >
                  Try background remover
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 sm:w-auto"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </FadeInView>
        </SectionShell>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
