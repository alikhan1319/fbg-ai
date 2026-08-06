import { BRAND } from "@/lib/constants";
import { absoluteUrl, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";

export type ToolSoftwareSchemaInput = {
  name: string;
  description: string;
  urlPath: string;
  category?: string;
};

export function ToolSoftwareApplicationSchema({
  name,
  description,
  urlPath,
  category = "ImageEditingApplication",
}: ToolSoftwareSchemaInput) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: category,
    operatingSystem: "Web",
    url: absoluteUrl(urlPath),
    description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: BRAND.shortName, url: absoluteUrl("/") },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function ToolWebPageSchema({
  name,
  description,
  urlPath,
}: {
  name: string;
  description: string;
  urlPath: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(urlPath),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: PRIMARY_KEYWORD_TITLE,
      url: absoluteUrl("/"),
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function ToolFAQSchema({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
