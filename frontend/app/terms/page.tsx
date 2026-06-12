import type { Metadata } from "next";
import { BRAND, CONTACT } from "@/lib/constants";
import { PRIMARY_KEYWORD_TITLE, TERMS_SEO, absoluteUrl } from "@/lib/seo";
import { TermsPageContent } from "@/components/pages/TermsPageContent";
import { DynamicLegalPageContentWrapper } from "@/components/pages/DynamicLegalPageContent";
import { BreadcrumbSchema, ToolWebPageSchema } from "@/components/tool/ToolSchemas";
import { getSiteLegalPage } from "@/lib/site-server";

export const revalidate = 30;
export const metadata: Metadata = {
  title: { absolute: TERMS_SEO.title },
  description: TERMS_SEO.description,
  keywords: [...TERMS_SEO.keywords],
  alternates: { canonical: TERMS_SEO.canonical },
  openGraph: {
    title: TERMS_SEO.title,
    description: TERMS_SEO.description,
    url: TERMS_SEO.canonical,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: TERMS_SEO.title,
    description: TERMS_SEO.description,
  },
  robots: { index: true, follow: true },
};

function TermsPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TERMS_SEO.title,
    description: TERMS_SEO.description,
    url: absoluteUrl(TERMS_SEO.path),
    inLanguage: "en-US",
    dateModified: "2026-05-29",
    isPartOf: {
      "@type": "WebSite",
      name: PRIMARY_KEYWORD_TITLE,
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: "Terms of Service",
      description: `Usage rules and legal terms for ${BRAND.name} including acceptable use, free tier limits, and user responsibilities.`,
    },
    publisher: {
      "@type": "Organization",
      name: PRIMARY_KEYWORD_TITLE,
      alternateName: BRAND.shortName,
      url: absoluteUrl("/"),
      email: CONTACT.supportEmail,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default async function TermsPage() {
  const page = await getSiteLegalPage("terms");

  return (
    <>
      <TermsPageSchema />
      <ToolWebPageSchema
        name={TERMS_SEO.title}
        description={TERMS_SEO.description}
        urlPath={TERMS_SEO.path}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: TERMS_SEO.path },
        ]}
      />
      <DynamicLegalPageContentWrapper page={page} variant="terms" fallback={<TermsPageContent />} />
    </>
  );
}