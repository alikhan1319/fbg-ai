import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { REMOVE_BG_SEO, PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";
import { type ToolPageConfig } from "@/components/tool/ToolLayout";
import { ToolPageWrapper } from "@/components/tool/ToolPageWrapper";
import {
  BreadcrumbSchema,
  ToolSoftwareApplicationSchema,
  ToolWebPageSchema,
} from "@/components/tool/ToolSchemas";

const urlPath = REMOVE_BG_SEO.path;
const og = `${SITE_URL.replace(/\/$/, "")}${urlPath}/opengraph-image`;

export const metadata: Metadata = {
  title: REMOVE_BG_SEO.title,
  description: REMOVE_BG_SEO.description,
  keywords: [...REMOVE_BG_SEO.keywords],
  alternates: { canonical: REMOVE_BG_SEO.canonical },
  openGraph: {
    title: REMOVE_BG_SEO.title,
    description: REMOVE_BG_SEO.description,
    url: urlPath,
    type: "website",
    images: [{ url: og, width: 1200, height: 630, alt: `${PRIMARY_KEYWORD_TITLE} — remove background online` }],
  },
  twitter: {
    card: "summary_large_image",
    title: REMOVE_BG_SEO.title,
    description: REMOVE_BG_SEO.description,
    images: [og],
  },
  robots: { index: true, follow: true },
};

const config: ToolPageConfig = {
  id: "remove-bg",
  route: urlPath,
  primaryKeyword: PRIMARY_KEYWORD,
  h1: `${PRIMARY_KEYWORD_TITLE} — Remove Image Background Online Free`,
  subheadline:
    "Upload any photo and let our free background remover AI deliver a clean transparent PNG — hair-level edges, no watermark, no signup, ready in seconds.",
  ctaLabel: "Upload Image Now",
  trustLine: "No signup required • No watermark • Auto-delete in 1 hour",
  heroGradientClass: "btn-gradient",
  uploadLabel: "Upload & preview background removal",
  processingLabel: "AI is removing your background…",
  successLabel: "Background removed successfully!",
  downloadLabel: "Download PNG",
  howItWorks: [
    { title: "Upload", description: "Drop a JPG/PNG/WebP up to 15MB — no account needed." },
    { title: "Detect subject", description: "AI finds the subject and refines edges like hair and fur." },
    { title: "Remove background", description: "Background is removed instantly with clean transparency." },
    { title: "Download", description: "Export a transparent PNG or use a solid color background." },
  ],
  features: [
    { title: "Instant background removal", description: "Cut out people, products, pets, and vehicles in seconds." },
    { title: "Edge refinement", description: "Preserves hair, fur, lace, and fine object details." },
    { title: "Transparent PNG export", description: "Download clean transparency for marketplaces and design tools." },
    { title: "Replace background", description: "Swap to solid color, gradient, or scene-ready backdrops." },
    { title: "High quality results", description: "Crisp edges optimized for e-commerce and marketing." },
    { title: "Privacy-first deletion", description: "Uploads expire quickly so your images stay yours." },
    { title: "~2 second processing", description: "Most images are processed in about two seconds on modern devices." },
    { title: "No watermark", description: "Download your cutout without branding or hidden overlays." },
    { title: "Mobile-ready", description: "Works smoothly on phone, tablet, and desktop." },
  ],
  showcase: [
    {
      id: "portrait",
      title: "Portrait — transparent PNG",
      subtitle: "Messy room with poor lighting → clean studio cutout",
      before: "/images/remove-bg/portrait-before.jpg",
      after: "/images/remove-bg/portrait-after.png",
      altBefore: "Person standing in a messy room with poor lighting before background removal",
      altAfter: "Same person with background removed on transparent checkerboard",
      transparentAfter: true,
      demoImage: "/images/remove-bg/portrait-before.jpg",
    },
    {
      id: "product",
      title: "Product photo — listing ready",
      subtitle: "Busy colored backdrop → clean gradient listing",
      before: "/images/remove-bg/product-sneaker-before.jpg",
      after: "/images/remove-bg/product-sneaker-after.jpg",
      altBefore: "Red sneaker on a bold studio backdrop before background removal",
      altAfter: "Same sneaker isolated on a soft gradient background for e-commerce",
      transparentAfter: false,
      demoImage: "/images/remove-bg/product-sneaker-before.jpg",
    },
    {
      id: "pet",
      title: "Pet cutout — fur details",
      subtitle: "Grass with distracting background → transparent PNG",
      before: "/images/remove-bg/pet-before.jpg",
      after: "/images/remove-bg/pet-after.png",
      altBefore: "Dog on grass with a busy outdoor background before removal",
      altAfter: "Same pet extracted with transparent background and crisp fur edges",
      transparentAfter: true,
      demoImage: "/images/remove-bg/pet-before.jpg",
    },
  ],
  useCases: [
    { title: "E-commerce sellers", description: "Clean product images that convert on Shopify, Amazon, and Etsy.", iconLabel: "Products" },
    { title: "Photographers", description: "Studio-style cutouts and quick client deliverables.", iconLabel: "Portraits" },
    { title: "Designers", description: "Transparent assets for posters, ads, and thumbnails.", iconLabel: "Design" },
    { title: "Social media teams", description: "Fast cutouts for campaigns, stories, and UGC.", iconLabel: "Social" },
    { title: "Real estate & vehicles", description: "Isolate subjects for clean listings and marketplaces.", iconLabel: "Listings" },
    { title: "Developers", description: "Prototype image workflows with predictable outputs.", iconLabel: "Workflow" },
  ],
  relatedIntro: "Explore the full FBR AI suite — upscale, generate backgrounds, remove watermarks, blur backgrounds, and enhance images.",
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
        thumb: "/images/remove-bg/portrait-before.jpg",
        full: "/images/remove-bg/portrait-before.jpg",
      },
      {
        id: "product",
        label: "Try product",
        thumb: "/images/remove-bg/product-sneaker-before.jpg",
        full: "/images/remove-bg/product-sneaker-before.jpg",
      },
      {
        id: "pet",
        label: "Try pet",
        thumb: "/images/remove-bg/pet-before.jpg",
        full: "/images/remove-bg/pet-before.jpg",
      },
    ],
  },
};

export default function RemoveBgPage() {
  return (
    <>
      <ToolWebPageSchema
        name={REMOVE_BG_SEO.title}
        description={REMOVE_BG_SEO.description}
        urlPath={urlPath}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: PRIMARY_KEYWORD_TITLE, path: urlPath },
        ]}
      />
      <ToolSoftwareApplicationSchema
        name={PRIMARY_KEYWORD_TITLE}
        description={REMOVE_BG_SEO.description}
        urlPath={urlPath}
      />
      <ToolPageWrapper config={config} />
    </>
  );
}
