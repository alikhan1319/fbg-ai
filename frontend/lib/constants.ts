/** Bump when replacing logo/icon files so Next Image + browsers drop the old cache. */
export const ASSET_V = "20260806c";

export const BRAND = {
  name: "Free Background Remover AI",
  shortName: "FBG AI",
  companyName: "TAH Digital Solutions",
  logo: `/img/web-logo.png?v=${ASSET_V}`,
  icon: `/img/web-icon.png?v=${ASSET_V}`,
  tagline: "6-in-1 AI image editing — free & instant",
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://freebackgroundremoverai.com";

function envText(key: string, fallback: string) {
  const value = process.env[key]?.trim();
  return value || fallback;
}

export const CONTACT = {
  supportEmail: envText(
    "NEXT_PUBLIC_CONTACT_SUPPORT_EMAIL",
    "support@freebackgroundremoverai.com"
  ),
  generalEmail: envText(
    "NEXT_PUBLIC_CONTACT_GENERAL_EMAIL",
    "hello@freebackgroundremoverai.com"
  ),
  privacyEmail: envText(
    "NEXT_PUBLIC_CONTACT_PRIVACY_EMAIL",
    "privacy@freebackgroundremoverai.com"
  ),
  responseTime: envText(
    "NEXT_PUBLIC_CONTACT_RESPONSE_TIME",
    "Within 24–48 hours on business days"
  ),
  hours: envText(
    "NEXT_PUBLIC_CONTACT_HOURS",
    "Monday – Friday, 9:00 AM – 6:00 PM"
  ),
  location: envText(
    "NEXT_PUBLIC_CONTACT_LOCATION",
    "Remote-first team · Worldwide support"
  ),
} as const;

/** Social links from env — leave a URL empty in .env to hide that network */
function socialFromEnv(
  label: "Instagram" | "Facebook",
  envKey: string,
  fallback: string
): { label: "Instagram" | "Facebook"; href: string } | null {
  const raw = process.env[envKey];
  // Explicit empty string in env = hide
  if (raw !== undefined && raw.trim() === "") return null;
  const href = (raw?.trim() || fallback).trim();
  if (!href) return null;
  return { label, href };
}

export const SOCIAL_LINKS = [
  socialFromEnv("Instagram", "NEXT_PUBLIC_SOCIAL_INSTAGRAM", "https://www.instagram.com/"),
  socialFromEnv("Facebook", "NEXT_PUBLIC_SOCIAL_FACEBOOK", "https://www.facebook.com/"),
].filter((item): item is { label: "Instagram" | "Facebook"; href: string } => item != null);

export const LEGAL = {
  privacyLastUpdated: "May 29, 2026",
  termsLastUpdated: "May 29, 2026",
} as const;

export const AI_TOOLS = [
  {
    id: "remove-bg",
    name: "Remove BG",
    fullName: "Background Remover",
    description: "Free background remover AI — cut out subjects with hair-level edges. Export transparent PNG in seconds.",
    icon: "eraser",
    href: "#remove-bg",
    route: "/remove-bg",
    primary: true,
  },
  {
    id: "upscale",
    name: "Upscale",
    fullName: "Image Upscaler",
    description: "Increase resolution up to 4× while preserving sharp details and natural textures.",
    icon: "maximize",
    href: "#upscale",
    route: "/upscale",
  },
  {
    id: "gen-bg",
    name: "Gen BG",
    fullName: "Generate Background",
    description: "Replace plain backgrounds with AI-generated scenes that match your subject.",
    icon: "image-plus",
    href: "#gen-bg",
    route: "/generate-background",
  },
  {
    id: "watermark",
    name: "Watermark Remover",
    fullName: "Watermark Remover",
    description: "Clean unwanted watermarks and logos while keeping your image quality intact.",
    icon: "stamp",
    href: "#watermark",
    route: "/remove-watermark",
  },
  {
    id: "blur-bg",
    name: "Blur BG",
    fullName: "Background Blur",
    description: "Create professional depth-of-field blur — subject sharp, background beautifully soft.",
    icon: "droplets",
    href: "#blur-bg",
    route: "/blur-background",
  },
  {
    id: "enhance",
    name: "Enhance",
    fullName: "Image Enhancer",
    description: "Fix lighting, color, and clarity in one click for studio-ready results.",
    icon: "sparkles",
    href: "#enhance",
    route: "/enhance-image",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Upload Your Image",
    description: "Drag & drop JPG, PNG, or WebP. No account required to start.",
    icon: "upload",
  },
  {
    step: 2,
    title: "Choose Your AI Tool",
    description: "Select remove BG, upscale, enhance, blur, watermark removal, or gen background.",
    icon: "wand",
  },
  {
    step: 3,
    title: "AI Processes Instantly",
    description: "Our models analyze edges, lighting, and detail in seconds — not minutes.",
    icon: "cpu",
  },
  {
    step: 4,
    title: "Download Your Result",
    description: "Get high-quality PNG or JPG. Files auto-delete within 1 hour for privacy.",
    icon: "download",
  },
] as const;

export const KEY_FEATURES = [
  { title: "100% AI Powered", description: "State-of-the-art models for cutouts, upscaling, and enhancement.", icon: "brain" },
  { title: "Free to Start", description: "Use core tools without signup. No credit card required.", icon: "gift" },
  { title: "Privacy First", description: "Uploads auto-delete within 1 hour. We don't sell your images.", icon: "shield" },
  { title: "No Watermark", description: "Clean exports on free tier — your work stays yours.", icon: "badge-check" },
  { title: "HD & 4K Export", description: "Download high-resolution results for print and web.", icon: "image" },
  { title: "Batch Ready", description: "Process multiple images efficiently (Pro workflows).", icon: "layers" },
  { title: "Hair-Level Edges", description: "Fine detail preserved on hair, fur, glass, and lace.", icon: "scan" },
  { title: "Mobile Friendly", description: "Edit on phone, tablet, or desktop — same great experience.", icon: "smartphone" },
  { title: "Fast Processing", description: "Most jobs complete in under 10 seconds.", icon: "zap" },
  { title: "Multiple Formats", description: "Support for JPG, PNG, and WebP input formats.", icon: "file-image" },
] as const;

export const WHY_CHOOSE = {
  us: [
    "Free core tools, no signup",
    "6 tools in one platform",
    "Privacy-first auto-delete",
    "No output watermark",
    "Hair & edge precision",
    "Mobile-optimized UI",
  ],
  others: [
    "Paid or limited free tier",
    "Single-tool focus",
    "Unclear data retention",
    "Watermarked exports",
    "Basic edge detection",
    "Desktop-only experience",
  ],
} as const;

export const TESTIMONIALS = [
  {
    name: "Sarah J.",
    role: "Product Photographer",
    company: "Studio North",
    quote: "Removed backgrounds for 200+ product photos in an afternoon. Quality rivals paid tools.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    name: "James L.",
    role: "Portrait Photographer",
    company: "Lens & Light Co.",
    quote: "The edge detection on hair is impressive. My clients love the transparent PNG exports.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    name: "Priya K.",
    role: "Social Media Manager",
    company: "Bloom Digital",
    quote: "Upscale + remove BG in one place saved our team hours every week.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    name: "Alex R.",
    role: "Graphic Designer",
    company: "Pixel Forge",
    quote: "Clean UI, fast results, and no watermark — exactly what I needed for client work.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    name: "Maria G.",
    role: "E-commerce Founder",
    company: "Artisan Goods",
    quote: "I use the blur and enhance tools for marketing visuals. Free and reliable.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  },
  {
    name: "David T.",
    role: "Content Creator",
    company: "Creator Lab",
    quote: "Gen BG and remove BG combo is a game-changer for YouTube thumbnails.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
] as const;

export const FAQ_ITEMS = [
  { question: "Is Free Background Remover AI really free?", answer: "Yes. Core tools including background removal are free to use with fair usage limits. No credit card is required to get started." },
  { question: "Do I need to create an account?", answer: "No signup is required for basic use. Upload your image, process it, and download — all in your browser." },
  { question: "What image formats are supported?", answer: "We support JPG, JPEG, PNG, and WebP for uploads. Downloads are typically PNG (with transparency) or JPG depending on the tool." },
  { question: "How long are my images stored?", answer: "For privacy, uploaded files are automatically deleted within 1 hour. We do not use your images for training without consent." },
  { question: "Can I use results commercially?", answer: "You retain rights to your uploaded images and processed outputs. Please ensure you have rights to the original content you upload." },
  { question: "How accurate is AI background removal?", answer: "Our models excel at portraits, products, and objects with complex edges including hair, fur, and glass." },
  { question: "Is there a watermark on downloads?", answer: "No. Free tier exports do not include a platform watermark on your processed images." },
  { question: "Does it work on mobile?", answer: "Yes. The site is fully responsive and works on modern mobile browsers." },
  { question: "What is the maximum file size?", answer: "We recommend images up to 25MB for optimal speed. Larger files may take longer to process." },
  { question: "Can I remove watermarks from any image?", answer: "Only use the watermark remover on images you own or have permission to edit. Respect copyright and intellectual property." },
  { question: "How does FBG AI compare to remove.bg?", answer: "We offer six AI tools in one platform — not just background removal — with a generous free tier, no output watermark, and privacy-first auto-delete." },
  { question: "Is batch processing available?", answer: "Batch workflows are available for power users. Start with single-image processing on the free tier and scale as your needs grow." },
  { question: "What resolution can I export?", answer: "Exports support HD and up to 4K depending on the tool and source image quality. Upscaler can enhance resolution up to 4×." },
  { question: "Do you offer an API?", answer: "API access for developers is on our roadmap. Join the newsletter to get notified when it launches." },
] as const;

export const STATS = [
  { label: "Images Processed", value: 2, suffix: "M+", icon: "images" as const },
  { label: "Happy Users", value: 150, suffix: "K+", icon: "users" as const },
  { label: "Average Rating", value: 4.9, suffix: "/5", icon: "star" as const, decimals: 1 },
  { label: "Processing Speed", value: 1, suffix: " sec", icon: "zap" as const, prefix: "< " },
] as const;

export { BLOG_POSTS, type BlogPost } from "@/lib/blog-posts";

export const UPLOAD_DEMO_CHIPS = [
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
] as const;

/** Shared frame size for home Results cards so all three sliders match in the grid. */
export const RESULTS_CARD_ASPECT = "aspect-[4/5]" as const;

export const BEFORE_AFTER_EXAMPLES = [
  {
    id: "portrait",
    title: "Portrait — Background Removed",
    subtitle: "Real cutout with clean edges and natural tones",
    before: "/images/remove-bg/portrait-before.jpg",
    after: "/images/remove-bg/portrait-after.png",
    altBefore: "Portrait before background removal",
    altAfter: "Portrait after real AI background removal",
    transparentAfter: true,
    imageFit: "contain",
    aspectClass: RESULTS_CARD_ASPECT,
    demoImage: "/images/remove-bg/portrait-before.jpg",
    route: "/remove-bg",
  },
  {
    id: "product",
    title: "Product — Upscaled Detail",
    subtitle: "Real product image enhanced for sharper listing quality",
    before: "/images/upscale/product-before-portrait.jpg",
    after: "/images/upscale/product-after-portrait.jpg",
    altBefore: "Product image before upscaling",
    altAfter: "Product image after real AI upscaling",
    transparentAfter: false,
    imageFit: "contain",
    aspectClass: RESULTS_CARD_ASPECT,
    demoImage: "/images/upscale/product-before-portrait.jpg",
    route: "/upscale",
  },
  {
    id: "generated-bg",
    title: "Pet — Generated Blue Background",
    subtitle: "New real example with a clean blue generated background",
    before: "/images/generate-bg/home-pet-before-v3.jpg",
    after: "/images/generate-bg/home-pet-after-blue-v3.jpg",
    altBefore: "Pet photo before generated background",
    altAfter: "Pet photo after generated blue background",
    transparentAfter: false,
    imageFit: "contain",
    aspectClass: RESULTS_CARD_ASPECT,
    demoImage: "/images/generate-bg/home-pet-before-v3.jpg",
    route: "/generate-background",
  },
] as const;
