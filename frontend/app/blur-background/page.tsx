import type { Metadata } from "next";
import { type ToolPageConfig } from "@/components/tool/ToolLayout";
import { ToolPageWrapper } from "@/components/tool/ToolPageWrapper";
import {
  BreadcrumbSchema,
  ToolSoftwareApplicationSchema,
  ToolWebPageSchema,
} from "@/components/tool/ToolSchemas";
import { BLUR_SEO, toolOgImage } from "@/lib/seo";

const urlPath = BLUR_SEO.path;
const og = toolOgImage(urlPath);

export const metadata: Metadata = {
  title: BLUR_SEO.title,
  description: BLUR_SEO.description,
  keywords: [...BLUR_SEO.keywords],
  alternates: { canonical: BLUR_SEO.canonical },
  openGraph: {
    title: BLUR_SEO.title,
    description: BLUR_SEO.description,
    url: urlPath,
    type: "website",
    images: [{ url: og, width: 1200, height: 630, alt: "FBG AI Background Blur" }],
  },
  twitter: {
    card: "summary_large_image",
    title: BLUR_SEO.title,
    description: BLUR_SEO.description,
    images: [og],
  },
  robots: { index: true, follow: true },
};

const config: ToolPageConfig = {
  id: "blur-bg",
  route: urlPath,
  primaryKeyword: "blur background",
  h1: "Background Blur Online | AI Portrait Blur & Bokeh Effect",
  subheadline:
    "Create a premium depth-of-field look: keep your subject sharp while the background becomes beautifully soft. Adjustable intensity for a natural bokeh feel.",
  ctaLabel: "Blur Background",
  trustLine: "No signup required • Adjustable blur • Fast processing",
  heroGradientClass: "btn-gradient",
  uploadLabel: "Upload & preview background blur",
  processingLabel: "AI is applying background blur…",
  successLabel: "Background blurred successfully!",
  downloadLabel: "Download Blurred",
  howItWorks: [
    { title: "Upload", description: "Add a portrait or product image up to 15MB." },
    { title: "Detect subject", description: "AI keeps the subject sharp and isolates the background." },
    { title: "Adjust blur", description: "Choose intensity for natural portrait-mode results." },
    { title: "Download", description: "Export a clean, share-ready image." },
  ],
  features: [
    { title: "Adjustable blur slider", description: "Fine-tune background blur from subtle to dramatic." },
    { title: "Portrait mode effect", description: "Keep the subject sharp with a natural falloff." },
    { title: "Bokeh-style look", description: "Soft highlights that feel like a real lens." },
    { title: "Selective blur workflows", description: "Designed for keeping key areas sharp (UI-ready)." },
    { title: "Great for products", description: "Make products pop on desks and lifestyle shots." },
    { title: "Fast preview", description: "See results quickly without complex controls." },
    { title: "No signup", description: "Start instantly from your browser." },
    { title: "Mobile-friendly", description: "Touch-friendly controls and responsive layout." },
    { title: "Privacy-first deletion", description: "Uploads expire automatically within 1 hour." },
  ],
  showcase: [
    {
      id: "portrait",
      title: "Portrait → premium depth",
      subtitle: "Subject sharp, background softened",
      before: "/images/blur-background/portrait-before-real.jpg",
      after: "/images/blur-background/portrait-after-real.jpg",
      altBefore: "Portrait photo before background blur",
      altAfter: "Portrait photo after background blur",
      demoImage: "/images/blur-background/portrait-before-real.jpg",
    },
    {
      id: "desk-product",
      title: "Product on desk → spotlight",
      subtitle: "Better focus for listings and ads",
      before: "/images/blur-background/product-before-real-portrait.jpg",
      after: "/images/blur-background/product-after-real-portrait.jpg",
      altBefore: "Product photo before blur",
      altAfter: "Product photo after blur",
      demoImage: "/images/blur-background/product-before-real-portrait.jpg",
    },
    {
      id: "pet",
      title: "Pet → portrait-style bokeh",
      subtitle: "Soft background without losing fur detail",
      before: "/images/blur-background/pet-before-real.jpg",
      after: "/images/blur-background/pet-after-real.jpg",
      altBefore: "Pet photo before blur",
      altAfter: "Pet photo after blur",
      demoImage: "/images/blur-background/pet-before-real.jpg",
    },
  ],
  useCases: [
    { title: "Portrait photographers", description: "Create portrait-mode bokeh without re-shooting.", iconLabel: "Portraits" },
    { title: "E-commerce", description: "Make products pop against soft backgrounds.", iconLabel: "Products" },
    { title: "Creators", description: "Upgrade thumbnails and cover images instantly.", iconLabel: "Creator" },
    { title: "Social teams", description: "Keep the subject clear in busy lifestyle shots.", iconLabel: "Social" },
    { title: "Designers", description: "Create background separation for layouts and ads.", iconLabel: "Design" },
    { title: "Agencies", description: "Fast iteration for client-ready visuals.", iconLabel: "Agency" },
  ],
  relatedIntro: "Use Remove BG, Upscale, and Enhance together with Blur Background for a complete pro editing workflow.",
  layoutOptions: {
    useLiveApi: true,
    hideAdsSidebar: true,
    enhancedUpload: true,
    showcaseColumns: 3,
    relatedToolsLayout: "grid",
    demoChips: [
      {
        id: "portrait-blur",
        label: "Try portrait",
        thumb: "/images/blur-background/portrait-before-real.jpg",
        full: "/images/blur-background/portrait-before-real.jpg",
      },
      {
        id: "product-blur",
        label: "Try product",
        thumb: "/images/blur-background/product-before-real-portrait.jpg",
        full: "/images/blur-background/product-before-real-portrait.jpg",
      },
      {
        id: "pet-blur",
        label: "Try pet",
        thumb: "/images/blur-background/pet-before-real.jpg",
        full: "/images/blur-background/pet-before-real.jpg",
      },
    ],
  },
};

export default function BlurBackgroundPage() {
  return (
    <>
      <ToolWebPageSchema name={BLUR_SEO.title} description={BLUR_SEO.description} urlPath={urlPath} />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Background Blur", path: urlPath },
        ]}
      />
      <ToolSoftwareApplicationSchema
        name="FBG AI Background Blur"
        description={BLUR_SEO.description}
        urlPath={urlPath}
      />
      <ToolPageWrapper config={config} />
    </>
  );
}

