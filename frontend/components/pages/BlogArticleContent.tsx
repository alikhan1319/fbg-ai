"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Sparkles,
  BookOpen,
  Wrench,
  Share2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { BlogPostCard } from "@/components/ui/BlogPostCard";
import { BRAND } from "@/lib/constants";
import type { BlogPost } from "@/lib/blog-posts";
import type { CmsBlogArticle, CmsBlogPost } from "@/lib/cms-server";
import { getRelatedBlogPosts } from "@/lib/blog";
import { isUploadedBlogImage, resolveBlogHtmlImages, resolveBlogImage } from "@/lib/media-url";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE, EDITORIAL_AUTHOR } from "@/lib/seo";

function slugifyHeading(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function BlogArticleContent({
  article,
  relatedPosts,
}: {
  article: CmsBlogArticle | (BlogPost & { sections: { heading?: string; paragraphs: string[] }[]; contentHtml?: string });
  relatedPosts?: readonly CmsBlogPost[] | readonly BlogPost[];
}) {
  const sections = article.sections ?? [];
  const htmlContent = "contentHtml" in article ? article.contentHtml : undefined;
  const related = relatedPosts ?? getRelatedBlogPosts(article.slug);
  const toc = htmlContent
    ? []
    : sections
        .map((s) => s.heading)
        .filter((h): h is string => Boolean(h));

  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        {/* Hero — title only */}
        <section className="bg-brand-navy relative overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-12">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-purple/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-16 top-32 h-64 w-64 rounded-full bg-brand-secondary/10 blur-3xl" aria-hidden />

          <div className="relative mx-auto w-full max-w-[1280px] px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
              <Link href="/" className="font-medium transition-colors hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <Link href="/blog" className="font-medium transition-colors hover:text-brand-secondary">
                Blog
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <span className="line-clamp-1 font-semibold text-brand-text">{article.category}</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              <span className="inline-flex items-center gap-1.5 studio-label">
                <Sparkles className="h-3.5 w-3.5 text-brand-purple" aria-hidden />
                {article.category}
              </span>
              <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-4xl lg:text-[2.75rem]">
                {article.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-brand-muted">
                {article.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-brand-muted">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-secondary" aria-hidden />
                  {article.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-secondary" aria-hidden />
                  {article.readTime}
                </span>
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-secondary" aria-hidden />
                  {EDITORIAL_AUTHOR.name}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured image + content (left) · sidebar (right) */}
        <SectionShell className="pb-16 pt-4 sm:pt-6" ariaLabel="Article content">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_320px]">
            <FadeInView className="min-w-0">
              {/* Featured image */}
              <div className="relative aspect-[16/10] overflow-hidden  border border-brand-border bg-brand-card   sm:rounded-3xl">
                <Image
                  src={resolveBlogImage(article.image)}
                  alt={article.imageAlt}
                  fill
                  unoptimized={isUploadedBlogImage(article.image)}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 760px"
                  priority
                />
              </div>

              <article className="mt-10 min-w-0">
                {htmlContent ? (
                  <div
                    className="blog-prose"
                    dangerouslySetInnerHTML={{ __html: resolveBlogHtmlImages(htmlContent) }}
                  />
                ) : (
                <div className="space-y-10">
                  {sections.map((section, i) => {
                    const sectionId = section.heading ? slugifyHeading(section.heading) : `section-${i}`;
                    return (
                      <section key={sectionId} id={sectionId} className="scroll-mt-28">
                        {section.heading ? (
                          <div className="mb-5 flex items-start gap-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br bg-brand-secondary text-sm font-bold text-brand-navy">
                              {i + 1}
                            </span>
                            <h2 className="pt-1.5 text-2xl font-bold tracking-tight text-brand-text sm:text-[1.65rem]">
                              {section.heading}
                            </h2>
                          </div>
                        ) : null}
                        <div
                          className={`space-y-4 ${section.heading ? "pl-0 sm:pl-14" : ""}`}
                        >
                          {section.paragraphs.map((p, j) => (
                            <p
                              key={j}
                              className="text-base leading-[1.85] text-brand-muted sm:text-[17px]"
                            >
                              {p}
                            </p>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
                )}

                {/* Tags / share row */}
                <div className="mt-12 flex flex-col gap-4 border-t border-brand-border pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-card px-3 py-1 text-xs font-semibold text-brand-muted">
                      {article.category}
                    </span>
                    <span className="rounded-full bg-brand-card px-3 py-1 text-xs font-semibold text-brand-muted">
                      {PRIMARY_KEYWORD}
                    </span>
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm text-brand-muted">
                    <Share2 className="h-4 w-4" aria-hidden />
                    Share this guide with your team
                  </p>
                </div>
              </article>
            </FadeInView>

            {/* Sidebar */}
            <aside className="min-w-0 space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="border border-brand-border  border border-brand-border bg-white p-5  ">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">On this page</p>
                {toc.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {toc.map((heading) => (
                      <li key={heading}>
                        <a
                          href={`#${slugifyHeading(heading)}`}
                          className="block text-sm text-brand-muted transition-colors hover:text-brand-secondary"
                        >
                          {heading}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-brand-muted">Quick read — scroll to explore the full guide.</p>
                )}
              </div>

              <div className="overflow-hidden  border border-brand-secondary/30 bg-gradient-to-br bg-brand-secondary p-6 text-white  ">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Wrench className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold">Try the tool</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Apply this guide instantly with our free {PRIMARY_KEYWORD_TITLE} — no signup required.
                </p>
                <Link
                  href={article.toolLink}
                  className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-secondary transition-transform hover:scale-[1.02]"
                >
                  Open tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className=" border border-brand-border bg-brand-card/50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Published by</p>
                <p className="mt-2 font-semibold text-brand-text">{EDITORIAL_AUTHOR.name}</p>
                <p className="mt-1 text-sm text-brand-muted">
                  {EDITORIAL_AUTHOR.company} · {BRAND.shortName}
                </p>
                <Link
                  href="/about"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
                >
                  About {BRAND.shortName}
                </Link>
                <Link
                  href="/blog"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" aria-hidden />
                  All blog articles
                </Link>
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-secondary"
                >
                  Back to homepage
                </Link>
              </div>
            </aside>
          </div>
        </SectionShell>

        {/* Related posts */}
        {(related?.length ?? 0) > 0 && (
          <SectionShell className="border-t border-brand-border/60 bg-brand-card/40 pb-20" ariaLabel="Related articles">
            <SectionHeading
              align="left"
              label="Keep reading"
              title="Related"
              highlight="articles"
              description="More guides from the Free Background Remover AI blog."
            />
            <StaggerGrid className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((post) => (
                <StaggerGridItem key={post.slug}>
                  <BlogPostCard post={post} showCategory />
                </StaggerGridItem>
              ))}
            </StaggerGrid>
          </SectionShell>
        )}

        {/* CTA */}
        <SectionShell className="pb-28 sm:pb-32 pt-0" ariaLabel="Get started">
          <FadeInView className="relative overflow-hidden  border border-white/10 bg-brand-navy px-8 py-14 text-center   sm:px-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-secondary/25 via-transparent to-brand-purple/20" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Put this guide into action
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
                Use our{" "}
                <Link href="/remove-bg" className="font-semibold text-white underline underline-offset-4 hover:text-brand-accent">
                  {PRIMARY_KEYWORD}
                </Link>{" "}
                or explore every free tool on the{" "}
                <Link href="/" className="font-semibold text-white underline underline-offset-4 hover:text-brand-accent">
                  homepage
                </Link>
                .
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={article.toolLink}
                  className="btn-ripple btn-gradient btn-shine inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-brand-navy sm:w-auto"
                >
                  Try related tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
                >
                  Back to blog
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
