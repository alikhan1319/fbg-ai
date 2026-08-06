import { AI_TOOLS, BRAND, FAQ_ITEMS, SITE_URL } from "@/lib/constants";
import { HOME_SEO, PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE, absoluteUrl } from "@/lib/seo";
import type { SiteFaqItem } from "@/lib/site-server";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: PRIMARY_KEYWORD_TITLE,
    alternateName: BRAND.shortName,
    url: absoluteUrl("/"),
    logo: absoluteUrl(BRAND.logo),
    description: HOME_SEO.description,
    /** Add verified social profile URLs here when available */
    sameAs: [] as string[],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function WebPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: PRIMARY_KEYWORD_TITLE,
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Thing",
      name: PRIMARY_KEYWORD,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PRIMARY_KEYWORD_TITLE,
    alternateName: BRAND.shortName,
    url: absoluteUrl("/"),
    description: HOME_SEO.description,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function WebAppSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: PRIMARY_KEYWORD_TITLE,
    alternateName: [BRAND.shortName, BRAND.name],
    url: SITE_URL,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    keywords: HOME_SEO.keywords.join(", "),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: AI_TOOLS.map((t) => t.fullName),
    description: HOME_SEO.description,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function FAQSchema({ items }: { items?: SiteFaqItem[] }) {
  const faqItems = items?.length
    ? items.map((item) => ({ question: item.question, answer: item.answer }))
    : FAQ_ITEMS;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function HomePageSchemas({ faqItems }: { faqItems?: SiteFaqItem[] }) {
  return (
    <>
      <WebSiteSchema />
      <OrganizationSchema />
      <WebPageSchema
        name={HOME_SEO.title}
        description={HOME_SEO.description}
        path="/"
      />
      <WebAppSchema />
      <FAQSchema items={faqItems} />
    </>
  );
}
