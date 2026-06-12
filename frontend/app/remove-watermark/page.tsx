import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { type ToolPageConfig } from "@/components/tool/ToolLayout";
import { ToolPageWrapper } from "@/components/tool/ToolPageWrapper";
import { ToolSoftwareApplicationSchema } from "@/components/tool/ToolSchemas";

const urlPath = "/remove-watermark";
const og = `${SITE_URL.replace(/\/$/, "")}${urlPath}/opengraph-image`;

export const metadata: Metadata = {
  title: "AI Watermark Remover | Remove Watermarks from Images Online",
  description:
    "Remove watermarks from images with FBR AI's smart inpainting. Auto-detect or manually target the watermark area, then export a clean result. Free to start, no signup.",
  keywords: [
    "remove watermark from image",
    "AI watermark remover",
    "watermark remover online",
    "inpainting",
    "remove logo from photo",
    "clean image",
  ],
  alternates: { canonical: urlPath },
  openGraph: {
    title: "AI Watermark Remover - FBR AI",
    description: "Smart inpainting to remove watermarks and logos from your own images.",
    url: urlPath,
    type: "website",
    images: [{ url: og, width: 1200, height: 630, alt: "FBR AI Watermark Remover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Watermark Remover - FBR AI",
    description: "Remove watermarks with smart inpainting.",
    images: [og],
  },
};

const config: ToolPageConfig = {
  id: "watermark",
  route: urlPath,
  primaryKeyword: "remove watermark from image",
  h1: "AI Watermark Remover | Remove Watermarks from Images Online",
  subheadline:
    "Clean your images with smart inpainting. Target watermark regions manually or rely on auto-detect — only use this tool on content you own or have permission to edit.",
  ctaLabel: "Remove Watermark",
  trustLine: "No signup required • No watermark • Auto-delete in 1 hour",
  heroGradientClass: "btn-gradient",
  uploadLabel: "Upload & preview watermark removal",
  processingLabel: "AI is removing the watermark…",
  successLabel: "Watermark removed successfully!",
  downloadLabel: "Download Clean Image",
  howItWorks: [
    { title: "Upload", description: "Add your image (JPG/PNG/WebP) up to 15MB." },
    { title: "Mark area", description: "Paint over the watermark — nothing runs until you confirm." },
    { title: "Inpaint", description: "AI fills the region with realistic texture and detail." },
    { title: "Download", description: "Export a clean image for your workflow." },
  ],
  features: [
    { title: "Smart inpainting", description: "Natural fill that preserves surrounding texture." },
    { title: "Precision brush", description: "Paint only the watermark — the rest of the image stays untouched." },
    { title: "Color-safe inpainting", description: "Reconstructs marked pixels while preserving surrounding tones." },
    { title: "Before/after verification", description: "Preview changes to ensure quality." },
    { title: "Batch-ready design", description: "Optimized UX for multi-image workflows (up to 5 planned)." },
    { title: "Safe & compliant", description: "Clear reminders to respect copyright and ownership." },
    { title: "Fast exports", description: "Get a clean file quickly with minimal waiting." },
    { title: "No watermark added", description: "We never add a new watermark to your output." },
    { title: "Privacy-first deletion", description: "Uploads expire quickly after processing." },
  ],
  showcase: [
    {
      id: "portrait",
      title: "Portrait watermark → clean frame",
      subtitle: "Top-left watermark removed with clean inpainting",
      before: "/images/remove-watermark/portrait-before-v5.jpg",
      after: "/images/remove-watermark/portrait-after-v5.jpg",
      altBefore: "Portrait image with visible top-left watermark before removal",
      altAfter: "Portrait image after watermark removal with restored details",
      demoImage: "/images/remove-watermark/portrait-before-v5.jpg",
    },
    {
      id: "product",
      title: "Product watermark → listing ready",
      subtitle: "Top-left sample mark removed for clean catalog use",
      before: "/images/remove-watermark/product-before-v5.jpg",
      after: "/images/remove-watermark/product-after-v5.jpg",
      altBefore: "Product image with top-left watermark before removal",
      altAfter: "Product image after watermark removal",
      demoImage: "/images/remove-watermark/product-before-v5.jpg",
    },
    {
      id: "pet",
      title: "Pet photo watermark → natural cleanup",
      subtitle: "Top-left text mark removed with clear, sharp texture",
      before: "/images/remove-watermark/pet-before-v5.jpg",
      after: "/images/remove-watermark/pet-after-v5.jpg",
      altBefore: "Pet image with top-left text watermark before removal",
      altAfter: "Pet image after text watermark removal",
      demoImage: "/images/remove-watermark/pet-before-v5.jpg",
    },
  ],
  useCases: [
    { title: "Your own product photos", description: "Remove your brand marks for marketplace variants.", iconLabel: "Products" },
    { title: "Agency workflows", description: "Clean client-owned assets safely and quickly.", iconLabel: "Agency" },
    { title: "Marketing teams", description: "Prepare assets for campaigns and ads.", iconLabel: "Marketing" },
    { title: "Designers", description: "Restore clean backgrounds for layouts.", iconLabel: "Design" },
    { title: "Creators", description: "Fix overlays on content you own.", iconLabel: "Creator" },
    { title: "Archival cleanup", description: "Restore scans with stamped marks (where permitted).", iconLabel: "Restore" },
  ],
  relatedIntro: "Explore the full FBR AI suite — upscale, generate backgrounds, remove backgrounds, blur backgrounds, and enhance images.",
  layoutOptions: {
    hideAdsSidebar: true,
    enhancedUpload: true,
    useLiveApi: true,
    showcaseColumns: 3,
    relatedToolsLayout: "grid",
    demoChips: [
      {
        id: "portrait",
        label: "Try portrait",
        thumb: "/images/remove-watermark/portrait-before-v5.jpg",
        full: "/images/remove-watermark/portrait-before-v5.jpg",
      },
      {
        id: "product",
        label: "Try product",
        thumb: "/images/remove-watermark/product-before-v5.jpg",
        full: "/images/remove-watermark/product-before-v5.jpg",
      },
      {
        id: "pet",
        label: "Try pet",
        thumb: "/images/remove-watermark/pet-before-v5.jpg",
        full: "/images/remove-watermark/pet-before-v5.jpg",
      },
    ],
  },
};

export default function RemoveWatermarkPage() {
  return (
    <>
      <ToolSoftwareApplicationSchema
        name="FBR AI Watermark Remover"
        description={metadata.description as string}
        urlPath={urlPath}
      />
      <ToolPageWrapper config={config} />
    </>
  );
}

