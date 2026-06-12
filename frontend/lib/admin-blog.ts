export const BLOG_CATEGORIES = [
  "Background removal",
  "Upscale",
  "Privacy",
  "Blur background",
  "Generate background",
  "Enhance",
  "Watermark",
  "E-commerce",
  "Social media",
  "Workflow",
  "Guides",
  "Comparisons",
] as const;

export const READ_TIME_OPTIONS = ["3 min read", "4 min read", "5 min read", "6 min read", "8 min read", "10 min read"];

export function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
