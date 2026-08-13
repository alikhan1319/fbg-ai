/**
 * Sitemap / redirect policy for Search Console.
 * Pages listed here stay on the site unless redirected; they are only
 * dropped from sitemap.xml or 301'd to a stronger canonical URL.
 */

/** Paths that should never appear in sitemap.xml (still publicly reachable). */
export const SITEMAP_EXCLUDE_PATHS = new Set([
  "/privacy",
  "/terms",
]);

/**
 * Duplicate / off-topic blog slugs to omit from the sitemap.
 * Redirected slugs are also listed here so Google is not asked to recrawl them.
 */
export const SITEMAP_EXCLUDE_BLOG_SLUGS = new Set([
  "free-meme-generator-online-create-viral-memes-in-seconds",
  // Background remover cluster → ai-background-remover-the-complete-2026-guide
  "free-background-remover-ai-the-complete-guide-to-instant-photo-cutouts",
  "free-background-remover-ai-tool-to-remove-bg-fast",
  "free-ai-background-remover-remove-image-backgrounds-instantly",
  // Transparent background cluster
  "how-to-make-an-image-background-transparent-online-free",
  // Transparent logo cluster
  "how-to-make-a-transparent-logo-free-fast",
  "how-do-i-make-a-logo-transparent-free-easy-guide",
  // White background cluster
  "remove-white-background-from-images-free-ai-photo-editor",
  // Upscaler cluster
  "ai-image-upscaler-upscale-images-online-free-no-quality-loss",
  "ai-image-upscaler-free-enhance-photos-without-losing-quality",
  // Enhancer cluster
  "ai-image-enhancer-guide-2026-free-background-remover-ai",
  "ai-image-enhancer-free-improve-photo-quality-online-instantly",
  // Background generator cluster
  "ai-background-generator-create-stunning-backgrounds-free",
  // Blur cluster
  "how-to-blur-background-like-dslr-free-ai-tool",
  // Amazon cluster
  "amazon-product-image-requirements-2026-full-seller-guide",
  // Watermark cluster
  "how-to-remove-watermarks-from-images-using-ai-free-background-remover-ai",
  // Car photos cluster
  "remove-background-from-car-photos-free-ai-tool-complete-guide",
]);

/** Permanent redirects: overlapping posts → chosen canonical. */
export const BLOG_CANONICAL_REDIRECTS: { source: string; destination: string }[] = [
  {
    source: "/blog/free-background-remover-ai-the-complete-guide-to-instant-photo-cutouts",
    destination: "/blog/ai-background-remover-the-complete-2026-guide",
  },
  {
    source: "/blog/free-background-remover-ai-tool-to-remove-bg-fast",
    destination: "/blog/ai-background-remover-the-complete-2026-guide",
  },
  {
    source: "/blog/free-ai-background-remover-remove-image-backgrounds-instantly",
    destination: "/blog/ai-background-remover-the-complete-2026-guide",
  },
  {
    source: "/blog/how-to-make-an-image-background-transparent-online-free",
    destination: "/blog/make-an-image-background-transparent-online-free",
  },
  {
    source: "/blog/how-to-make-a-transparent-logo-free-fast",
    destination: "/blog/how-to-remove-background-from-a-logo-without-photoshop-2026-guide",
  },
  {
    source: "/blog/how-do-i-make-a-logo-transparent-free-easy-guide",
    destination: "/blog/how-to-remove-background-from-a-logo-without-photoshop-2026-guide",
  },
  {
    source: "/blog/remove-white-background-from-images-free-ai-photo-editor",
    destination: "/blog/how-do-i-remove-a-white-background-full-guide",
  },
  {
    source: "/blog/ai-image-upscaler-upscale-images-online-free-no-quality-loss",
    destination: "/blog/how-to-upscale-images-without-losing-quality-2026",
  },
  {
    source: "/blog/ai-image-upscaler-free-enhance-photos-without-losing-quality",
    destination: "/blog/how-to-upscale-images-without-losing-quality-2026",
  },
  {
    source: "/blog/ai-image-enhancer-guide-2026-free-background-remover-ai",
    destination: "/blog/ai-image-enhancer-improve-photo-quality-online-free",
  },
  {
    source: "/blog/ai-image-enhancer-free-improve-photo-quality-online-instantly",
    destination: "/blog/ai-image-enhancer-improve-photo-quality-online-free",
  },
  {
    source: "/blog/ai-background-generator-create-stunning-backgrounds-free",
    destination: "/blog/ai-background-generator-the-complete-2026-guide-to-creating-professional-backgrounds-instantly",
  },
  {
    source: "/blog/how-to-blur-background-like-dslr-free-ai-tool",
    destination: "/blog/ai-blur-background-free-online-photo-blur-tool",
  },
  {
    source: "/blog/amazon-product-image-requirements-2026-full-seller-guide",
    destination: "/blog/amazon-product-image-requirements-2026",
  },
  {
    source: "/blog/how-to-remove-watermarks-from-images-using-ai-free-background-remover-ai",
    destination: "/blog/remove-watermarks-safely-what-you-need-to-know-2026-guide",
  },
  {
    source: "/blog/remove-background-from-car-photos-free-ai-tool-complete-guide",
    destination: "/blog/ai-background-remover-for-car-dealers-fast-free",
  },
];
