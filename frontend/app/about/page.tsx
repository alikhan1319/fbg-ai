import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { ABOUT_SEO, PRIMARY_KEYWORD_TITLE, absoluteUrl } from "@/lib/seo";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { BreadcrumbSchema, ToolWebPageSchema } from "@/components/tool/ToolSchemas";

export const metadata: Metadata = {
  title: { absolute: ABOUT_SEO.title },
  description: ABOUT_SEO.description,
  keywords: [...ABOUT_SEO.keywords],
  alternates: { canonical: ABOUT_SEO.canonical },
  openGraph: {
    title: ABOUT_SEO.title,
    description: ABOUT_SEO.description,
    url: ABOUT_SEO.canonical,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_SEO.title,
    description: ABOUT_SEO.description,
  },
  robots: { index: true, follow: true },
};

function AboutPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: ABOUT_SEO.title,
    description: ABOUT_SEO.description,
    url: absoluteUrl(ABOUT_SEO.path),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: PRIMARY_KEYWORD_TITLE,
      url: absoluteUrl("/"),
    },
    mainEntity: {
      "@type": "Organization",
      name: PRIMARY_KEYWORD_TITLE,
      alternateName: BRAND.shortName,
      url: absoluteUrl("/"),
      logo: absoluteUrl(BRAND.logo),
      description: ABOUT_SEO.description,
      sameAs: [],
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default function AboutPage() {
  return (
    <>
      <AboutPageSchema />
      <ToolWebPageSchema
        name={ABOUT_SEO.title}
        description={ABOUT_SEO.description}
        urlPath={ABOUT_SEO.path}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: ABOUT_SEO.path },
        ]}
      />
      <AboutPageContent />
    </>
  );
}
