import type { Metadata } from "next";
import { BRAND, CONTACT } from "@/lib/constants";
import { PRIVACY_SEO, PRIMARY_KEYWORD_TITLE, absoluteUrl } from "@/lib/seo";
import { PrivacyPageContent } from "@/components/pages/PrivacyPageContent";
import { DynamicLegalPageContentWrapper } from "@/components/pages/DynamicLegalPageContent";
import { BreadcrumbSchema, ToolWebPageSchema } from "@/components/tool/ToolSchemas";
import { getSiteLegalPage } from "@/lib/site-server";

export const revalidate = 30;
export const metadata: Metadata = {
  title: { absolute: PRIVACY_SEO.title },
  description: PRIVACY_SEO.description,
  keywords: [...PRIVACY_SEO.keywords],
  alternates: { canonical: PRIVACY_SEO.canonical },
  openGraph: {
    title: PRIVACY_SEO.title,
    description: PRIVACY_SEO.description,
    url: PRIVACY_SEO.canonical,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: PRIVACY_SEO.title,
    description: PRIVACY_SEO.description,
  },
  robots: { index: true, follow: true },
};

function PrivacyPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: PRIVACY_SEO.title,
    description: PRIVACY_SEO.description,
    url: absoluteUrl(PRIVACY_SEO.path),
    inLanguage: "en-US",
    dateModified: "2026-05-29",
    isPartOf: {
      "@type": "WebSite",
      name: PRIMARY_KEYWORD_TITLE,
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: "Privacy Policy",
      description: `Data handling practices for ${BRAND.name} including automatic image deletion and user privacy rights.`,
    },
    publisher: {
      "@type": "Organization",
      name: PRIMARY_KEYWORD_TITLE,
      alternateName: BRAND.shortName,
      url: absoluteUrl("/"),
      email: CONTACT.privacyEmail,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default async function PrivacyPage() {
  const page = await getSiteLegalPage("privacy");

  return (
    <>
      <PrivacyPageSchema />
      <ToolWebPageSchema
        name={PRIVACY_SEO.title}
        description={PRIVACY_SEO.description}
        urlPath={PRIVACY_SEO.path}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: PRIVACY_SEO.path },
        ]}
      />
      <DynamicLegalPageContentWrapper page={page} variant="privacy" fallback={<PrivacyPageContent />} />
    </>
  );
}