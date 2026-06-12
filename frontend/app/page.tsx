import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { HomePageSchemas } from "@/components/seo/JsonLd";
import { BRAND } from "@/lib/constants";
import { getCmsLatestBlogPosts } from "@/lib/cms-server";
import { getSiteFaq, getSiteTestimonials } from "@/lib/site-server";
import { HOME_SEO } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: HOME_SEO.title,
  description: HOME_SEO.description,
  keywords: [...HOME_SEO.keywords],
  alternates: { canonical: HOME_SEO.canonical },
  openGraph: {
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    url: HOME_SEO.canonical,
    type: "website",
    locale: "en_US",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_SEO.title,
    description: HOME_SEO.description,
  },
  robots: { index: true, follow: true },
};

export default async function Page() {
  const [latestPosts, faqItems, testimonials] = await Promise.all([
    getCmsLatestBlogPosts(3),
    getSiteFaq(),
    getSiteTestimonials(),
  ]);

  return (
    <>
      <HomePageSchemas faqItems={faqItems} />
      <HomePage latestPosts={latestPosts} faqItems={faqItems} testimonials={testimonials} />
    </>
  );
}
