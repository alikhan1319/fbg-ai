import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND } from "@/lib/constants";
import { getCmsBlogArticle, getCmsRelatedBlogPosts } from "@/lib/cms-server";
import { resolveBlogImageAbsolute } from "@/lib/media-url";
import { PRIMARY_KEYWORD_TITLE, absoluteUrl, EDITORIAL_AUTHOR } from "@/lib/seo";
import { BlogArticleContent } from "@/components/pages/BlogArticleContent";
import { BreadcrumbSchema } from "@/components/tool/ToolSchemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCmsBlogArticle(slug);
  if (!article) return { title: "Article not found" };

  const title = `${article.title} | ${BRAND.name} Blog`;
  const path = `/blog/${slug}`;

  return {
    title: { absolute: title },
    description: article.excerpt,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: article.excerpt,
      url: path,
      type: "article",
      publishedTime: article.date,
      siteName: BRAND.name,
      images: [{ url: resolveBlogImageAbsolute(article.image), alt: article.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.excerpt,
    },
    robots: { index: true, follow: true },
  };
}

function ArticleSchema({ article, slug }: { article: NonNullable<Awaited<ReturnType<typeof getCmsBlogArticle>>>; slug: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: {
      "@type": "Person",
      name: EDITORIAL_AUTHOR.name,
      worksFor: {
        "@type": "Organization",
        name: EDITORIAL_AUTHOR.company,
      },
    },
    publisher: {
      "@type": "Organization",
      name: PRIMARY_KEYWORD_TITLE,
      alternateName: BRAND.shortName,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    url: absoluteUrl(`/blog/${slug}`),
    image: resolveBlogImageAbsolute(article.image) || absoluteUrl(article.image),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getCmsBlogArticle(slug);
  if (!article) notFound();

  const relatedPosts = await getCmsRelatedBlogPosts(slug);

  return (
    <>
      <ArticleSchema article={article} slug={slug} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: article.title, path: `/blog/${slug}` },
        ]}
      />
      <BlogArticleContent article={article} relatedPosts={relatedPosts} />
    </>
  );
}
