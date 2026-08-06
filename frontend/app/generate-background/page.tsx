import type { Metadata } from "next";
import { type ToolPageConfig } from "@/components/tool/ToolLayout";
import { ToolPageWrapper } from "@/components/tool/ToolPageWrapper";
import {
  BreadcrumbSchema,
  ToolSoftwareApplicationSchema,
  ToolWebPageSchema,
} from "@/components/tool/ToolSchemas";
import { GEN_BG_SEO, toolOgImage } from "@/lib/seo";

const urlPath = GEN_BG_SEO.path;
const og = toolOgImage(urlPath);

export const metadata: Metadata = {
  title: GEN_BG_SEO.title,
  description: GEN_BG_SEO.description,
  keywords: [...GEN_BG_SEO.keywords],
  alternates: { canonical: GEN_BG_SEO.canonical },
  openGraph: {
    title: GEN_BG_SEO.title,
    description: GEN_BG_SEO.description,
    url: urlPath,
    type: "website",
    images: [{ url: og, width: 1200, height: 630, alt: "FBG AI Background Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: GEN_BG_SEO.title,
    description: GEN_BG_SEO.description,
    images: [og],
  },
  robots: { index: true, follow: true },
};

const config: ToolPageConfig = {
  id: "gen-bg",
  route: urlPath,
  primaryKeyword: "AI background generator",
  h1: "AI Background Generator | Generate Backgrounds for Images",
  subheadline:
    "Turn plain backdrops into premium scenes with text prompts, style presets, and lighting-aware AI — perfect for product and portrait visuals.",
  ctaLabel: "Generate Background",
  trustLine: "No signup required • No watermark • Auto-delete in 1 hour",
  heroGradientClass: "btn-gradient",
  uploadLabel: "Upload & generate a new background",
  processingLabel: "AI is generating your new background…",
  successLabel: "Background generated successfully!",
  downloadLabel: "Download Result",
  howItWorks: [
    { title: "Upload", description: "Drop your image — we keep your subject front-and-center." },
    { title: "Describe background", description: "Use a prompt like “sunset beach” or “studio white”." },
    { title: "Match lighting", description: "AI blends the scene to keep the subject believable." },
    { title: "Download", description: "Export a share-ready image for campaigns and stores." },
  ],
  features: [
    { title: "Text-to-background prompts", description: "Type what you want: studio, nature, abstract, or cinematic." },
    { title: "Style presets", description: "Studio, Nature, Abstract, Gradient — fast, consistent looks." },
    { title: "Solid color backgrounds", description: "Pick clean solid colors for catalogs and branding." },
    { title: "Lighting-aware blending", description: "Better realism with matched subject lighting and tones." },
    { title: "Brand-ready consistency", description: "Keep a cohesive look across product lines." },
    { title: "Fast iterations", description: "Generate multiple looks quickly for A/B testing." },
    { title: "No signup required", description: "Start immediately, directly in your browser." },
    { title: "Privacy-first deletion", description: "Uploads expire quickly after processing." },
    { title: "No watermark", description: "Download clean outputs without branding overlays." },
  ],
  showcase: [
    {
      id: "studio",
      title: "Solid ivory — premium product",
      subtitle: "Prompt: “clean solid ivory background”",
      before: "/images/generate-bg/product-before-v2.jpg",
      after: "/images/generate-bg/product-after-v2.jpg",
      altBefore: "Product photo before generating a new background",
      altAfter: "Product photo with AI-generated studio background",
      demoImage: "/images/generate-bg/product-before-v2.jpg",
    },
    {
      id: "forest",
      title: "Solid cool white — portrait",
      subtitle: "Prompt: “soft solid cool-white studio background”",
      before: "/images/generate-bg/portrait-before-v2.jpg",
      after: "/images/generate-bg/portrait-after-v2.jpg",
      altBefore: "Portrait image before generating a background",
      altAfter: "Portrait image with forest sun rays background",
      demoImage: "/images/generate-bg/portrait-before-v2.jpg",
    },
    {
      id: "cyberpunk",
      title: "Solid mint — pet profile",
      subtitle: "Prompt: “clean solid mint catalog background”",
      before: "/images/generate-bg/pet-before-v2.jpg",
      after: "/images/generate-bg/pet-after-v2.jpg",
      altBefore: "Pet image before generating a cyberpunk background",
      altAfter: "Pet image with cyberpunk city background",
      demoImage: "/images/generate-bg/pet-before-v2.jpg",
    },
  ],
  useCases: [
    { title: "E-commerce brands", description: "Create consistent product scenes across your catalog.", iconLabel: "Catalog" },
    { title: "Designers", description: "Generate quick scenes for posters, ads, and hero images.", iconLabel: "Design" },
    { title: "Social media managers", description: "Produce new backdrops for campaigns and UGC.", iconLabel: "Social" },
    { title: "Content creators", description: "Make thumbnails and visuals stand out instantly.", iconLabel: "Creator" },
    { title: "Photographers", description: "Offer background options without re-shooting.", iconLabel: "Portraits" },
    { title: "Agencies", description: "Iterate styles fast for clients and A/B tests.", iconLabel: "Agency" },
  ],
  relatedIntro: "Use related tools to remove backgrounds, upscale images, and finalize polished visuals in one workflow.",
  layoutOptions: {
    useLiveApi: true,
    hideAdsSidebar: true,
    enhancedUpload: true,
    showcaseColumns: 3,
    relatedToolsLayout: "grid",
    demoChips: [
      {
        id: "studio-demo",
        label: "Try studio",
        thumb: "/images/generate-bg/product-before-v2.jpg",
        full: "/images/generate-bg/product-before-v2.jpg",
      },
      {
        id: "forest-demo",
        label: "Try nature",
        thumb: "/images/generate-bg/portrait-before-v2.jpg",
        full: "/images/generate-bg/portrait-before-v2.jpg",
      },
      {
        id: "cyber-demo",
        label: "Try cyber",
        thumb: "/images/generate-bg/pet-before-v2.jpg",
        full: "/images/generate-bg/pet-before-v2.jpg",
      },
    ],
  },
};

export default function GenerateBackgroundPage() {
  return (
    <>
      <ToolWebPageSchema name={GEN_BG_SEO.title} description={GEN_BG_SEO.description} urlPath={urlPath} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Background Generator", path: urlPath },
        ]}
      />
      <ToolSoftwareApplicationSchema
        name="FBG AI Background Generator"
        description={GEN_BG_SEO.description}
        urlPath={urlPath}
      />
      <ToolPageWrapper config={config} />
    </>
  );
}

