import { BLOG_POSTS } from "@/lib/blog-posts";

export const BLOG_PAGE_SIZE = 12;

const allPosts = () => BLOG_POSTS ?? [];

export function getBlogTotalPages() {
  return Math.max(1, Math.ceil(allPosts().length / BLOG_PAGE_SIZE));
}

export function parseBlogPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, getBlogTotalPages());
}

export function getBlogPostsForPage(page: number) {
  const safePage = parseBlogPage(String(page));
  const start = (safePage - 1) * BLOG_PAGE_SIZE;
  return {
    page: safePage,
    totalPages: getBlogTotalPages(),
    totalPosts: allPosts().length,
    posts: allPosts().slice(start, start + BLOG_PAGE_SIZE),
  };
}

export function getBlogPageHref(page: number) {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

export function getRelatedBlogPosts(slug: string, limit = 3) {
  const posts = allPosts();
  const current = posts.find((p) => p.slug === slug);
  if (!current) return posts.slice(0, limit);

  const sameCategory = posts.filter(
    (p) => p.slug !== slug && p.category === current.category
  );
  const others = posts.filter(
    (p) => p.slug !== slug && p.category !== current.category
  );

  return [...sameCategory, ...others].slice(0, limit);
}
