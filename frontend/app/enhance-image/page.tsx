import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { type ToolPageConfig } from "@/components/tool/ToolLayout";
import { ToolPageWrapper } from "@/components/tool/ToolPageWrapper";
import { ToolSoftwareApplicationSchema } from "@/components/tool/ToolSchemas";

const urlPath = "/enhance-image";
const og = `${SITE_URL.replace(/\/$/, "")}${urlPath}/opengraph-image`;

export const metadata: Metadata = {
  title: "AI Image Enhancer | Improve Photo Quality Online",
  description:
    "Enhance images with FBR AI: auto color correction, brightness/contrast, sharpening, and denoise controls for clean, studio-ready results. Free to start, no signup.",
  keywords: [
    "image enhancer",
    "photo enhancer AI",
    "improve image quality",
    "denoise photo",
    "sharpen image",
    "color correction",
  ],
  alternates: { canonical: urlPath },
  openGraph: {
    title: "AI Image Enhancer - FBR AI",
    description: "Improve photo quality with color correction, sharpening, and denoise.",
    url: urlPath,
    type: "website",
    images: [{ url: og, width: 1200, height: 630, alt: "FBR AI Image Enhancer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Enhancer - FBR AI",
    description: "Enhance photos with AI in seconds.",
    images: [og],
  },
};

const config: ToolPageConfig = {
  id: "enhance",
  route: urlPath,
  primaryKeyword: "image enhancer",
  h1: "AI Image Enhancer | Improve Photo Quality Online",
  subheadline:
    "Make photos clearer and more vibrant with AI enhancement: smarter color correction, subtle HDR-style depth, and denoise + sharpening controls.",
  ctaLabel: "Enhance Image",
  trustLine: "No signup required • Sharpen & denoise • Fast processing",
  heroGradientClass: "btn-gradient",
  uploadLabel: "Upload & preview image enhancement",
  processingLabel: "AI is enhancing your image…",
  successLabel: "Enhancement completed successfully!",
  downloadLabel: "Download Enhanced",
  howItWorks: [
    { title: "Upload", description: "Drop a photo up to 15MB — JPG/PNG/WebP supported." },
    { title: "Auto-correct", description: "AI balances color, exposure, and contrast." },
    { title: "Refine details", description: "Adjust sharpening and denoise for a clean look." },
    { title: "Download", description: "Export a polished image ready to share or print." },
  ],
  features: [
    { title: "Auto color correction", description: "Natural-looking color balance and improved tones." },
    { title: "Brightness & contrast control", description: "Fine tuning that keeps details from clipping." },
    { title: "Sharpen slider", description: "Enhance micro-detail without heavy artifacts." },
    { title: "Denoise slider", description: "Clean up grain and compression noise." },
    { title: "HDR-style depth", description: "More pop and clarity with balanced contrast." },
    { title: "Optional face-friendly output", description: "Designed to keep skin textures natural." },
    { title: "Fast preview & export", description: "Quick feedback loop for creators and teams." },
    { title: "No watermark", description: "Clean outputs for professional work." },
    { title: "Privacy-first deletion", description: "Uploads expire automatically within 1 hour." },
  ],
  showcase: [
    {
      id: "portrait-enhance",
      title: "Portrait → clearer detail",
      subtitle: "Natural tone with sharper facial and hair detail",
      before: "/images/upscale/portrait-before.jpg",
      after: "/images/upscale/portrait-after.jpg",
      altBefore: "Portrait image before enhancement",
      altAfter: "Portrait image after enhancement",
      demoImage: "/images/upscale/portrait-before.jpg",
    },
    {
      id: "product-enhance",
      title: "Product → listing ready",
      subtitle: "Improved contrast and crisp product edges",
      before: "/images/upscale/product-before-portrait.jpg",
      after: "/images/upscale/product-after-portrait.jpg",
      altBefore: "Product image before enhancement",
      altAfter: "Product image after enhancement",
      demoImage: "/images/upscale/product-before-portrait.jpg",
    },
    {
      id: "pet-enhance",
      title: "Pet → clean and vibrant",
      subtitle: "Sharper fur texture with balanced brightness",
      before: "/images/upscale/pet-before.jpg",
      after: "/images/upscale/pet-after.jpg",
      altBefore: "Pet image before enhancement",
      altAfter: "Pet image after enhancement",
      demoImage: "/images/upscale/pet-before.jpg",
    },
  ],
  useCases: [
    { title: "Creators", description: "Improve photos for thumbnails, posts, and covers.", iconLabel: "Creator" },
    { title: "E-commerce", description: "Make product photos clearer and more consistent.", iconLabel: "Products" },
    { title: "Photographers", description: "Quick client previews and clean final exports.", iconLabel: "Photo" },
    { title: "Designers", description: "Polish assets for ads and hero sections.", iconLabel: "Design" },
    { title: "Social teams", description: "Repair compressed images from multiple sources.", iconLabel: "Social" },
    { title: "Archival projects", description: "Refresh old scans and faded photos.", iconLabel: "Restore" },
  ],
  relatedIntro: "Use Enhance with Upscale, Remove BG, and Blur Background for full-quality photo editing workflows.",
  layoutOptions: {
    useLiveApi: true,
    hideAdsSidebar: true,
    enhancedUpload: true,
    showcaseColumns: 3,
    relatedToolsLayout: "grid",
    demoChips: [
      {
        id: "portrait-enhance",
        label: "Try portrait",
        thumb: "/images/upscale/portrait-before.jpg",
        full: "/images/upscale/portrait-before.jpg",
      },
      {
        id: "product-enhance",
        label: "Try product",
        thumb: "/images/upscale/product-before-portrait.jpg",
        full: "/images/upscale/product-before-portrait.jpg",
      },
      {
        id: "pet-enhance",
        label: "Try pet",
        thumb: "/images/upscale/pet-before.jpg",
        full: "/images/upscale/pet-before.jpg",
      },
    ],
  },
};

export default function EnhanceImagePage() {
  return (
    <>
      <ToolSoftwareApplicationSchema
        name="FBR AI Image Enhancer"
        description={metadata.description as string}
        urlPath={urlPath}
      />
      <ToolPageWrapper config={config} />
    </>
  );
}

