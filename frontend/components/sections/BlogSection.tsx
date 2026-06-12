"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { CmsBlogPost } from "@/lib/cms-server";
import { BlogPostCard } from "@/components/ui/BlogPostCard";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
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

  return (
    <SectionShell id="blog" ariaLabel="Blog and resources">
      <SectionHeading
        label="Resources"
        title="Learn &"
        highlight="grow"
        description="Guides and tips for better AI image editing workflows."
      />

      <StaggerGrid className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {livePosts.map((post) => (
          <StaggerGridItem key={post.slug}>
            <BlogPostCard post={post} />
          </StaggerGridItem>
        ))}
      </StaggerGrid>

      <FadeInView className="mt-12 flex justify-center sm:mt-14">
        <Link
          href="/blog"
          className="group inline-flex min-h-[52px] items-center gap-3 rounded-2xl border border-brand-border/80 bg-white px-6 py-3.5 text-sm font-semibold text-brand-text shadow-md shadow-brand-secondary/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-secondary/40 hover:shadow-lg hover:shadow-brand-secondary/10 sm:px-8"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-secondary/15 to-brand-purple/10 text-brand-secondary transition-colors group-hover:from-brand-secondary group-hover:to-brand-purple group-hover:text-white">
            <BookOpen className="h-4 w-4" aria-hidden />
          </span>
          <span>View all blog articles</span>
          <ArrowRight
            className="h-4 w-4 text-brand-secondary transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </FadeInView>
    </SectionShell>
  );
}
