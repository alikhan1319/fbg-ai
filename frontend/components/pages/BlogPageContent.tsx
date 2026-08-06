"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchBlogPosts } from "@/services/cmsApi";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { StudioPageHero } from "@/components/ui/StudioPageHero";
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
  const [livePosts, setLivePosts] = useState<CmsBlogPost[]>([...(posts ?? [])]);
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
    setLivePosts([...(posts ?? [])]);
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
        <StudioPageHero
          crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
          label="Resources & guides"
          title={
            <>
              {PRIMARY_KEYWORD_TITLE} <span className="text-brand-secondary">Blog</span>
            </>
          }
          description={
            <>
              Guides, tips, and workflows for our{" "}
              <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                {PRIMARY_KEYWORD}
              </Link>
              , upscaler, enhancer, and the rest of our free tools on the{" "}
              <Link href="/" className="font-semibold text-brand-secondary hover:underline">
                homepage
              </Link>
              .
            </>
          }
        />

        <SectionShell ariaLabel="Blog articles" className="bg-brand-bg">
          <SectionHeading
            align="left"
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

          <FadeInView className="mt-16 border border-white/10 bg-brand-navy px-8 py-12 text-center sm:px-12">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Ready to try what you learned?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/55 sm:text-base">
              Put these guides into action with {BRAND.name} — start on our remove background tool or explore all six
              free AI editors.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/remove-bg"
                className="btn-gradient inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-6 text-sm font-semibold text-brand-navy sm:w-auto"
              >
                Try background remover
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[48px] w-full items-center justify-center border border-white/25 px-6 text-sm font-semibold text-white hover:border-brand-secondary hover:text-brand-secondary sm:w-auto"
              >
                Back to homepage
              </Link>
            </div>
          </FadeInView>
        </SectionShell>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
