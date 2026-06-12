import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCmsBlogPostsForPage, getCmsBlogSlugs } from "@/lib/cms-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");

  const [{ totalPages }, slugs] = await Promise.all([
    getCmsBlogPostsForPage(1),
    getCmsBlogSlugs(),
  ]);

  const blogPages = Array.from({ length: Math.max(1, totalPages) }, (_, i) =>
    i === 0 ? "/blog" : `/blog?page=${i + 1}`
  );

  const routes = [
    "",
    "/remove-bg",
    "/upscale",
    "/generate-background",
    "/remove-watermark",
    "/blur-background",
    "/enhance-image",
    "/about",
    "/contact",
    ...blogPages,
    "/privacy",
    "/terms",
    ...slugs.map((slug) => `/blog/${slug}`),
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/about" || path === "/remove-bg" || path === "/contact" || path.startsWith("/blog")
          ? 0.8
          : 0.6,
  }));
}
