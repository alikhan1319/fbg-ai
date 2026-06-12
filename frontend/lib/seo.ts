import { BRAND, LEGAL, SITE_URL } from "@/lib/constants";

/** Primary SEO target keyword */
export const PRIMARY_KEYWORD = "free background remover ai";

export const PRIMARY_KEYWORD_TITLE = "Free Background Remover AI";

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

export const REMOVE_BG_SEO = {
  title: "Free Background Remover AI | Remove Image Background Online Free",
  description:
    "Use Free Background Remover AI to cut out subjects in seconds. Upload a photo, get a clean transparent PNG — free, fast, no watermark, no signup required.",
  keywords: [
    PRIMARY_KEYWORD,
    "remove background free",
    "background remover online",
    "transparent PNG",
    "remove bg AI",
    "cut out image background",
  ],
  canonical: "/remove-bg",
  path: "/remove-bg",
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

export function absoluteUrl(path: string) {
  const base = siteBase();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
