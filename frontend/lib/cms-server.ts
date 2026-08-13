import { unstable_noStore as noStore } from "next/cache";
import { CMS_FETCH_OPTIONS, getServerApiUrl } from "@/lib/api-server";

export type CmsBlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  toolLink: string;
  image: string;
  imageAlt: string;
  status?: string;
  viewCount?: number;
};

export type CmsBlogArticle = CmsBlogPost & {
  sections: { heading?: string; paragraphs: string[] }[];
  contentHtml?: string;
};

async function fetchFromApi<T>(path: string): Promise<T | null> {
  noStore();
  const cacheBuster = `_=${Date.now()}`;
  const url = `${getServerApiUrl()}${path}${path.includes("?") ? "&" : "?"}${cacheBuster}`;
  try {
    const res = await fetch(url, CMS_FETCH_OPTIONS);
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[cms-server] ${path} returned ${res.status}`);
      }
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[cms-server] ${path} failed:`, error);
    }
    return null;
  }
}

export async function getCmsLatestBlogPosts(limit = 3): Promise<CmsBlogPost[]> {
  const data = await fetchFromApi<{ posts: CmsBlogPost[] }>(`/api/blog?page=1&limit=${limit}`);
  return data?.posts ?? [];
}

export async function getCmsBlogPostsForPage(page: number) {
  const safeRequest = Math.max(1, page);
  const data = await fetchFromApi<{
    page: number;
    totalPages: number;
    totalPosts: number;
    posts: CmsBlogPost[];
  }>(`/api/blog?page=${safeRequest}&limit=12`);

  if (data) {
    return {
      page: data.page,
      totalPages: data.totalPages,
      totalPosts: data.totalPosts,
      posts: data.posts,
    };
  }

  return {
    page: safeRequest,
    totalPages: 1,
    totalPosts: 0,
    posts: [] as CmsBlogPost[],
  };
}

export function parseBlogPageNumber(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export async function getCmsBlogArticle(slug: string): Promise<CmsBlogArticle | null> {
  return fetchFromApi<CmsBlogArticle>(`/api/blog/${encodeURIComponent(slug)}`);
}

export type CmsBlogSitemapEntry = {
  slug: string;
  lastmod?: string | null;
};

export async function getCmsBlogSlugs(): Promise<string[]> {
  const data = await fetchFromApi<{ slugs: string[] }>("/api/blog/slugs");
  return data?.slugs ?? [];
}

export async function getCmsBlogSitemapEntries(): Promise<CmsBlogSitemapEntry[]> {
  const data = await fetchFromApi<{ slugs?: string[]; entries?: CmsBlogSitemapEntry[] }>(
    "/api/blog/slugs"
  );
  if (data?.entries?.length) return data.entries;
  return (data?.slugs ?? []).map((slug) => ({ slug }));
}

export async function getCmsRelatedBlogPosts(slug: string, limit = 3): Promise<CmsBlogPost[]> {
  const data = await fetchFromApi<CmsBlogPost[]>(
    `/api/blog/${encodeURIComponent(slug)}/related?limit=${limit}`
  );
  return data ?? [];
}
