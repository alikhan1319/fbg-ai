import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { getCmsBlogPostsForPage, parseBlogPageNumber } from "@/lib/cms-server";
import { BLOG_SEO, PRIMARY_KEYWORD_TITLE, absoluteUrl } from "@/lib/seo";
import { BlogPageContent } from "@/components/pages/BlogPageContent";
import { BreadcrumbSchema, ToolWebPageSchema } from "@/components/tool/ToolSchemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page: rawPage } = await searchParams;
  const pageNum = parseBlogPageNumber(rawPage);
  const { page, totalPages } = await getCmsBlogPostsForPage(pageNum);
  const safePage = Math.min(page, totalPages);
  const pageTitle = safePage > 1 ? `${BLOG_SEO.title} — Page ${safePage}` : BLOG_SEO.title;
  const canonical = safePage > 1 ? `${BLOG_SEO.canonical}?page=${safePage}` : BLOG_SEO.canonical;

  return {
    title: { absolute: pageTitle },
    description: BLOG_SEO.description,
    keywords: [...BLOG_SEO.keywords],
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description: BLOG_SEO.description,
      url: canonical,
      type: "website",
      siteName: BRAND.name,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: BLOG_SEO.description,
    },
    robots: { index: true, follow: true },
  };
}

function BlogListingSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: BLOG_SEO.title,
    description: BLOG_SEO.description,
    url: absoluteUrl(BLOG_SEO.path),
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: PRIMARY_KEYWORD_TITLE,
      alternateName: BRAND.shortName,
      url: absoluteUrl("/"),
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const pageNum = parseBlogPageNumber(rawPage);
  const { page, totalPages, totalPosts, posts } = await getCmsBlogPostsForPage(pageNum);

  return (
    <>
      <BlogListingSchema />
      <ToolWebPageSchema name={BLOG_SEO.title} description={BLOG_SEO.description} urlPath={BLOG_SEO.path} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: BLOG_SEO.path },
        ]}
      />
      <BlogPageContent posts={posts} page={page} totalPages={totalPages} totalPosts={totalPosts} />
    </>
  );
}
