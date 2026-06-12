const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** Uploaded blog images live under /blog-media/ on the backend */
export function isUploadedBlogImage(path: string): boolean {
  return Boolean(path && path.includes("/blog-media/"));
}

/**
 * Resolve blog image paths for display.
 * Uploaded images use /blog-media/... proxied via next.config rewrites (same origin).
 */
export function resolveBlogImage(path: string): string {
  if (!path) return "";

  const blogMediaMatch = path.match(/\/blog-media\/[^\s"?#]+/);
  if (blogMediaMatch) return blogMediaMatch[0];

  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path;
}

/** Resolve image src inside rich-text HTML from the blog editor */
export function resolveBlogHtmlImages(html: string): string {
  if (!html) return html;

  return html.replace(/src="([^"]+)"/g, (match, src: string) => {
    if (!isUploadedBlogImage(src)) return match;
    return `src="${resolveBlogImage(src)}"`;
  });
}

/** Absolute URL for SEO / Open Graph */
export function resolveBlogImageAbsolute(path: string): string {
  const resolved = resolveBlogImage(path);
  if (!resolved) return "";
  if (resolved.startsWith("http://") || resolved.startsWith("https://")) return resolved;
  if (resolved.startsWith("/blog-media/")) return `${API_URL}${resolved}`;
  return resolved;
}

export { API_URL as BLOG_MEDIA_API_URL };
