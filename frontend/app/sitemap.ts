import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCmsBlogSitemapEntries } from "@/lib/cms-server";
import { getAllUseCasePaths } from "@/lib/use-case-landings";
import {
  SITEMAP_EXCLUDE_BLOG_SLUGS,
  SITEMAP_EXCLUDE_PATHS,
  STATIC_PAGE_LASTMOD,
} from "@/lib/seo-sitemap";

function parseLastmod(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const blogEntries = await getCmsBlogSitemapEntries();
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

  const includedPosts = blogEntries.filter((entry) => !SITEMAP_EXCLUDE_BLOG_SLUGS.has(entry.slug));
  const latestBlogLastmod = includedPosts
    .map((entry) => parseLastmod(entry.lastmod))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const staticLastmod = parseLastmod(STATIC_PAGE_LASTMOD);
  const staticRoutes = [
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
  ].filter((path) => !SITEMAP_EXCLUDE_PATHS.has(path));

  const items: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: staticLastmod,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : highPriority.has(path) ? 0.8 : 0.6,
  }));

  items.push({
    url: `${base}/blog`,
    lastModified: latestBlogLastmod ?? staticLastmod,
    changeFrequency: "weekly",
    priority: 0.8,
  });

  for (const entry of includedPosts) {
    items.push({
      url: `${base}/blog/${entry.slug}`,
      lastModified: parseLastmod(entry.lastmod) ?? staticLastmod,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return items;
}
