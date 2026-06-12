import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { type ToolPageConfig } from "@/components/tool/ToolLayout";
import { ToolPageWrapper } from "@/components/tool/ToolPageWrapper";
import { ToolSoftwareApplicationSchema } from "@/components/tool/ToolSchemas";

const urlPath = "/upscale";
const og = `${SITE_URL.replace(/\/$/, "")}${urlPath}/opengraph-image`;

export const metadata: Metadata = {
  title: "Free AI Image Upscaler | Upscale Photos 2x / 4x Online",
  description:
    "Upscale images 2× or 4× with FBR AI. Enhance resolution, sharpen details, and reduce noise for crisp results. Fast, free to start, no signup.",
  keywords: [
    "image upscaler",
    "upscale image",
    "enhance image resolution",
    "4x upscaler",
    "2x upscaler",
    "AI upscaler",
  ],
  alternates: { canonical: urlPath },
  openGraph: {
    title: "Free AI Image Upscaler - FBR AI",
    description: "Upscale photos 2× / 4× with sharp details and natural textures.",
    url: urlPath,
    type: "website",
    images: [{ url: og, width: 1200, height: 630, alt: "FBR AI Image Upscaler" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Image Upscaler - FBR AI",
    description: "Upscale images 2× or 4× in seconds.",
    images: [og],
  },
};

const config: ToolPageConfig = {
  id: "upscale",
  route: urlPath,
  primaryKeyword: "image upscaler",
  h1: "Free AI Image Upscaler | Upscale Photos 2x / 4x Online",
  subheadline:
    "Recover clarity from low-res images with 2×/4× upscaling, portrait-friendly enhancement, and fast exports for web or print.",
  ctaLabel: "Upscale Image Now",
  trustLine: "No signup required • No watermark • Auto-delete in 1 hour",
  heroGradientClass: "btn-gradient",
  uploadLabel: "Upload & preview image upscaling",
  processingLabel: "Upscaling your image...",
  successLabel: "Upscale completed successfully!",
  downloadLabel: "Download Upscaled",
  howItWorks: [
    { title: "Upload", description: "Drop a JPG/PNG/WebP up to 15MB." },
    { title: "Choose 2× or 4×", description: "Pick the best scale for social, web, or print." },
    { title: "Enhance details", description: "AI sharpens edges and reduces noise artifacts." },
    { title: "Download", description: "Export the upscaled result ready to publish." },
  ],
  features: [
    { title: "2× and 4× upscaling", description: "Choose the right boost for your destination." },
    { title: "Portrait-friendly output", description: "Optimized for faces and natural skin textures." },
    { title: "Denoise + sharpening", description: "Cleaner detail without harsh artifacts." },
    { title: "Zoom-ready comparison", description: "Preview before/after to validate sharpness." },
    { title: "Logo & text clarity", description: "Great for low-res logos and UI screenshots." },
    { title: "Fast exports", description: "Quick workflow for creators and teams." },
    { title: "Mobile-ready", description: "Upscale directly from your phone browser." },
    { title: "No watermark", description: "Clean downloads for professional use." },
    { title: "Privacy-first deletion", description: "Uploads expire quickly after processing." },
  ],
  showcase: [
    {
      id: "portrait",
      title: "Portrait photo — social ready",
      subtitle: "Low-res portrait restored with cleaner skin detail",
      before: "/images/upscale/portrait-before.jpg",
      after: "/images/upscale/portrait-after.jpg",
      altBefore: "Portrait image before upscaling",
      altAfter: "Portrait image after upscaling",
      demoImage: "/images/upscale/portrait-before.jpg",
    },
    {
      id: "product",
      title: "Product photo — listing ready",
      subtitle: "Sharper product edges for catalog and store pages",
      before: "/images/upscale/product-before-portrait.jpg",
      after: "/images/upscale/product-after-portrait.jpg",
      altBefore: "Product image before upscaling",
      altAfter: "Product image after upscaling",
      imageFit: "contain",
      aspectClass: "aspect-[4/5]",
      demoImage: "/images/upscale/product-before-portrait.jpg",
    },
    {
      id: "pet",
      title: "Pet photo — detail restored",
      subtitle: "Fur texture and edges look cleaner after upscaling",
      before: "/images/upscale/pet-before.jpg",
      after: "/images/upscale/pet-after.jpg",
      altBefore: "Pet image before upscaling",
      altAfter: "Pet image after upscaling",
      demoImage: "/images/upscale/pet-before.jpg",
    },
  ],
  useCases: [
    { title: "Creators & social", description: "Upscale thumbnails and posts for sharper feeds.", iconLabel: "Social" },
    { title: "E-commerce", description: "Make product photos look premium in catalogs.", iconLabel: "Products" },
    { title: "Design teams", description: "Improve assets for ads, banners, and print.", iconLabel: "Design" },
    { title: "Developers", description: "Enhance screenshots and UI assets quickly.", iconLabel: "UI" },
    { title: "Photographers", description: "Recover detail from older or compressed exports.", iconLabel: "Photo" },
    { title: "Brand managers", description: "Restore crisp logos for consistent branding.", iconLabel: "Brand" },
  ],
  relatedIntro: "After upscaling, use related tools to remove backgrounds, enhance details, and finalize edits in one workflow.",
  layoutOptions: {
    useLiveApi: true,
    hideAdsSidebar: true,
    enhancedUpload: true,
    showcaseColumns: 3,
    relatedToolsLayout: "grid",
    demoChips: [
      {
        id: "portrait-upscale",
        label: "Try portrait",
        thumb: "/images/upscale/portrait-before.jpg",
        full: "/images/upscale/portrait-before.jpg",
      },
      {
        id: "product-upscale",
        label: "Try product",
        thumb: "/images/upscale/product-before.jpg",
        full: "/images/upscale/product-before.jpg",
      },
      {
        id: "pet-upscale",
        label: "Try pet",
        thumb: "/images/upscale/pet-before.jpg",
        full: "/images/upscale/pet-before.jpg",
      },
    ],
  },
};

export default function UpscalePage() {
  return (
    <>
      <ToolSoftwareApplicationSchema
        name="FBR AI Image Upscaler"
        description={metadata.description as string}
        urlPath={urlPath}
      />
      <ToolPageWrapper config={config} />
    </>
  );
}

