import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCmsBlogSlugs } from "@/lib/cms-server";
import { getAllUseCasePaths } from "@/lib/use-case-landings";
import { SITEMAP_EXCLUDE_BLOG_SLUGS, SITEMAP_EXCLUDE_PATHS } from "@/lib/seo-sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const slugs = await getCmsBlogSlugs();
  const useCasePaths = getAllUseCasePaths();

  const highPriority = new Set([
    "",
    "/remove-bg",
    "/about",
    "/contact",
    "/blog",
    "/use-cases",
    ...useCasePaths,
  ]);

  const routes = [
    "",
    "/remove-bg",
    "/upscale",
    "/generate-background",
    "/remove-watermark",
    "/blur-background",
    "/enhance-image",
    ...useCasePaths,
    "/use-cases",
    "/about",
    "/contact",
    "/blog",
    ...slugs
      .filter((slug) => !SITEMAP_EXCLUDE_BLOG_SLUGS.has(slug))
      .map((slug) => `/blog/${slug}`),
  ].filter((path) => !SITEMAP_EXCLUDE_PATHS.has(path));

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : highPriority.has(path) || path.startsWith("/blog") ? 0.8 : 0.6,
  }));
}
