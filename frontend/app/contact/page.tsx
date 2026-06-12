import type { Metadata } from "next";
import { BRAND, CONTACT } from "@/lib/constants";
import { CONTACT_SEO, PRIMARY_KEYWORD_TITLE, absoluteUrl } from "@/lib/seo";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { BreadcrumbSchema, ToolWebPageSchema } from "@/components/tool/ToolSchemas";

export const metadata: Metadata = {
  title: { absolute: CONTACT_SEO.title },
  description: CONTACT_SEO.description,
  keywords: [...CONTACT_SEO.keywords],
  alternates: { canonical: CONTACT_SEO.canonical },
  openGraph: {
    title: CONTACT_SEO.title,
    description: CONTACT_SEO.description,
    url: CONTACT_SEO.canonical,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: CONTACT_SEO.title,
    description: CONTACT_SEO.description,
  },
  robots: { index: true, follow: true },
};

function ContactPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: CONTACT_SEO.title,
    description: CONTACT_SEO.description,
    url: absoluteUrl(CONTACT_SEO.path),
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
      email: CONTACT.supportEmail,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT.supportEmail,
          availableLanguage: ["English"],
          areaServed: "Worldwide",
        },
        {
          "@type": "ContactPoint",
          contactType: "general inquiries",
          email: CONTACT.generalEmail,
          availableLanguage: ["English"],
        },
        {
          "@type": "ContactPoint",
          contactType: "privacy",
          email: CONTACT.privacyEmail,
          availableLanguage: ["English"],
        },
      ],
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export default function ContactPage() {
  return (
    <>
      <ContactPageSchema />
      <ToolWebPageSchema
        name={CONTACT_SEO.title}
        description={CONTACT_SEO.description}
        urlPath={CONTACT_SEO.path}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Contact", path: CONTACT_SEO.path },
        ]}
      />
      <ContactPageContent />
    </>
  );
}
