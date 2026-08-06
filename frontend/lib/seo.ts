import { BRAND, LEGAL, SITE_URL } from "@/lib/constants";

/** Primary SEO target keyword */
export const PRIMARY_KEYWORD = "free background remover ai";

export const PRIMARY_KEYWORD_TITLE = "Free Background Remover AI";

/** Editorial author for BlogPosting EEAT */
export const EDITORIAL_AUTHOR = {
  name: "FBG AI Editorial",
  company: BRAND.companyName,
} as const;

const siteBase = () => SITE_URL.replace(/\/$/, "");

export const HOME_SEO = {
  title: "Free Background Remover AI | Remove BG Online Free — 6 AI Tools",
  description:
    "Free Background Remover AI removes image backgrounds instantly online. Transparent PNG export, no signup, no watermark — plus upscale, enhance, blur & more.",
  keywords: [
    PRIMARY_KEYWORD,
    "free background remover",
    "remove background online free",
    "AI background remover",
    "transparent background PNG",
    "remove bg no signup",
    BRAND.shortName,
  ],
  canonical: "/",
  ogUrl: siteBase(),
} as const;

/** Tool page: long-tail “remove image background online free” — reduces home cannibalization */
export const REMOVE_BG_SEO = {
  title: "Remove Image Background Online Free | Transparent PNG — FBG AI",
  description:
    "Remove image background online free with FBG AI. Upload a photo, get a clean transparent PNG in seconds — no signup, no watermark, hair-level edges.",
  keywords: [
    "remove image background online free",
    "transparent background maker",
    "remove white background from image",
    "ai image background remover without watermark",
    "remove background from png",
    "free ai background remover",
    PRIMARY_KEYWORD,
  ],
  canonical: "/remove-bg",
  path: "/remove-bg",
} as const;

export const UPSCALE_SEO = {
  title: "Free AI Image Upscaler | Upscale Photos 2x / 4x Online — FBG AI",
  description:
    "Upscale images 2× or 4× with FBG AI. Sharpen details, reduce noise, and export crisp results for web or print. Free to start, no signup.",
  keywords: [
    "image upscaler",
    "upscale image online free",
    "AI upscaler 4x",
    "enhance image resolution",
    "2x upscaler",
    BRAND.shortName,
  ],
  canonical: "/upscale",
  path: "/upscale",
} as const;

export const GEN_BG_SEO = {
  title: "AI Background Generator | Replace Photo Backgrounds Free — FBG AI",
  description:
    "Generate AI backgrounds for product and portrait photos with FBG AI. Solid colors, studio scenes, and prompt-ready backdrops — free to start, no signup.",
  keywords: [
    "AI background generator",
    "replace photo background",
    "generate background online",
    "product background AI",
    BRAND.shortName,
  ],
  canonical: "/generate-background",
  path: "/generate-background",
} as const;

export const WATERMARK_SEO = {
  title: "AI Watermark Remover | Clean Photos Online Free — FBG AI",
  description:
    "Remove watermarks from your own images with FBG AI smart inpainting. Mark the area, restore detail, export clean results. Free to start, no signup.",
  keywords: [
    "watermark remover",
    "remove watermark online free",
    "AI watermark remover",
    "clean photo watermark",
    BRAND.shortName,
  ],
  canonical: "/remove-watermark",
  path: "/remove-watermark",
} as const;

export const BLUR_SEO = {
  title: "Blur Background Online | Portrait Depth Effect Free — FBG AI",
  description:
    "Blur background online with FBG AI. Keep subjects sharp with adjustable blur intensity for portraits and product photos. Free to start, no signup.",
  keywords: [
    "blur background online",
    "background blur AI",
    "portrait depth of field",
    "blur photo background free",
    BRAND.shortName,
  ],
  canonical: "/blur-background",
  path: "/blur-background",
} as const;

export const ENHANCE_SEO = {
  title: "AI Image Enhancer | Sharpen, Denoise & Color Correct — FBG AI",
  description:
    "Enhance images with FBG AI: sharpening, denoise, and color correction for clean studio-ready results. Free to start, no signup.",
  keywords: [
    "AI image enhancer",
    "enhance photo online free",
    "sharpen image AI",
    "denoise photo",
    BRAND.shortName,
  ],
  canonical: "/enhance-image",
  path: "/enhance-image",
} as const;

export const ABOUT_SEO = {
  title: "About Free Background Remover AI | Mission, Story & Free AI Tools",
  description:
    "Learn about Free Background Remover AI — the free online platform for background removal, upscaling, enhancement, and more. No signup, no watermark, privacy-first.",
  keywords: [
    PRIMARY_KEYWORD,
    "about free background remover ai",
    "free AI image editor",
    "online background removal",
    BRAND.shortName,
  ],
  canonical: "/about",
  path: "/about",
} as const;

export const CONTACT_SEO = {
  title: "Contact Free Background Remover AI | Support & Help",
  description:
    "Contact Free Background Remover AI for support, feedback, or partnership inquiries. Email our team — we reply within 24–48 hours. Help with background removal & all AI tools.",
  keywords: [
    PRIMARY_KEYWORD,
    "contact free background remover ai",
    "background remover support",
    "AI image editor help",
    "free background remover contact",
    BRAND.shortName,
  ],
  canonical: "/contact",
  path: "/contact",
} as const;

export const PRIVACY_SEO = {
  title: "Privacy Policy | Free Background Remover AI — Your Data & Images",
  description:
    "Read the Free Background Remover AI privacy policy. Learn how uploaded images are processed, auto-deleted within 1 hour, never sold, and protected with privacy-first AI tools.",
  keywords: [
    PRIMARY_KEYWORD,
    "free background remover ai privacy policy",
    "background remover data privacy",
    "AI image editor privacy",
    "uploaded images deleted",
    "GDPR image tools",
    BRAND.shortName,
  ],
  canonical: "/privacy",
  path: "/privacy",
  lastUpdated: LEGAL.privacyLastUpdated,
} as const;

export const TERMS_SEO = {
  title: "Terms of Service | Free Background Remover AI — Usage Rules",
  description:
    "Read the Terms of Service for Free Background Remover AI. Understand acceptable use, free tier limits, content rights, and rules for our background remover and AI image tools.",
  keywords: [
    PRIMARY_KEYWORD,
    "free background remover ai terms of service",
    "background remover terms",
    "AI image editor terms",
    "free tool usage policy",
    BRAND.shortName,
  ],
  canonical: "/terms",
  path: "/terms",
  lastUpdated: LEGAL.termsLastUpdated,
} as const;

export const BLOG_SEO = {
  title: "Blog | Free Background Remover AI — Tips, Guides & AI Editing",
  description:
    "Read the Free Background Remover AI blog for guides on background removal, upscaling, privacy, and e-commerce photo workflows. Expert tips for our free AI image tools.",
  keywords: [
    PRIMARY_KEYWORD,
    "background remover blog",
    "AI image editing tips",
    "remove background guide",
    "e-commerce product photos",
    BRAND.shortName,
  ],
  canonical: "/blog",
  path: "/blog",
} as const;

/** Related blog guides per tool route — for internal linking on tool pages */
export const TOOL_RELATED_GUIDES: Record<
  string,
  { title: string; href: string }[]
> = {
  "remove-bg": [
    {
      title: "How to Remove Backgrounds for E-commerce Product Photos",
      href: "/blog/remove-backgrounds-ecommerce-product-photos",
    },
    {
      title: "Portrait Background Removal: Hair & Edge Tips",
      href: "/blog/portrait-background-removal-hair-edge-tips",
    },
    {
      title: "How to Remove Background Without Photoshop",
      href: "/blog/remove-background-without-photoshop",
    },
  ],
  upscale: [
    {
      title: "AI Image Upscaling: When to Use 2× vs 4×",
      href: "/blog/ai-image-upscaling-2x-vs-4x",
    },
    {
      title: "Upscale Old Photos for Print & Posters",
      href: "/blog/upscale-old-photos-for-print-posters",
    },
  ],
  "generate-background": [
    {
      title: "Generate AI Backgrounds for Product Listings",
      href: "/blog/generate-ai-backgrounds-product-listings",
    },
    {
      title: "Best Background Colors for Passport Photos",
      href: "/blog/best-background-colors-passport-photos",
    },
  ],
  "remove-watermark": [
    {
      title: "Remove Watermarks Safely: What You Need to Know",
      href: "/blog/remove-watermarks-safely-legal-guide",
    },
  ],
  "blur-background": [
    {
      title: "Blur Background for Professional Portrait Photos",
      href: "/blog/blur-background-professional-portraits",
    },
    {
      title: "Blur Background vs Remove Background: Which to Choose?",
      href: "/blog/blur-vs-remove-background-which-to-choose",
    },
  ],
  "enhance-image": [
    {
      title: "Enhance Image Quality Without Over-Editing",
      href: "/blog/enhance-image-quality-without-over-editing",
    },
    {
      title: "PNG vs JPG: Which Format Should You Use?",
      href: "/blog/png-vs-jpg-which-format",
    },
  ],
};

export function absoluteUrl(path: string) {
  const base = siteBase();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function toolOgImage(path: string) {
  return `${siteBase()}${path}/opengraph-image`;
}
