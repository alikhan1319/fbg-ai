"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminBadge, AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { resolveBlogImage } from "@/lib/media-url";
import { deleteAdminBlogPost, fetchAdminBlogPosts } from "@/services/cmsApi";
import { useToast } from "@/components/ui/ToastProvider";

type BlogRow = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  status: string;
};

export function BlogManagementContent() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await fetchAdminBlogPosts()) as BlogRow[];
      setPosts(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const categories = useMemo(() => {
    return [...new Set(posts.map((p) => p.category))].sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery =
        query.trim() === "" ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || post.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [posts, query, category]);

  const publishedCount = posts.filter((p) => p.status === "published").length;

  const onDelete = async (post: BlogRow) => {
    if (deletingId === post.id) return;
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

    setDeletingId(post.id);
    try {
      await deleteAdminBlogPost(post.id);
      const refreshed = (await fetchAdminBlogPosts()) as BlogRow[];
      setPosts(refreshed);
      const stillThere = refreshed.some((row: BlogRow) => row.id === post.id);
      if (stillThere) {
        showToast("Delete did not save. Restart the backend and try again.", "error");
        return;
      }
      showToast("Post deleted.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      if (message.toLowerCase().includes("not found")) {
        await loadPosts();
        showToast("Post was already removed. List updated.", "info");
      } else {
        showToast(message, "error");
        await loadPosts();
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-secondary" />
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Blog management"
        description="Create, edit, and delete blog articles stored in MySQL."
        action={
          <Link
            href="/admin/blog/new"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
          >
            <Plus className="h-4 w-4" />
            New post
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminCard>
          <p className="text-sm text-brand-muted">Total posts</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-text">{posts.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-brand-muted">Categories</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-text">{categories.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-sm text-brand-muted">Published</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-text">{publishedCount}</p>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or excerpt..."
              className="w-full rounded-xl border border-brand-border bg-brand-bg py-2.5 pl-10 pr-4 text-sm text-brand-text outline-none transition-colors focus:border-brand-secondary"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-secondary"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-border text-xs uppercase tracking-wider text-brand-muted">
                <th className="pb-3 pr-4 font-semibold">Article</th>
                <th className="pb-3 pr-4 font-semibold">Category</th>
                <th className="pb-3 pr-4 font-semibold">Date</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className="border-b border-brand-border/70 last:border-0">
                  <td className="py-4 pr-4">
                    <div className="flex min-w-[280px] items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-brand-card">
                        <Image src={resolveBlogImage(post.image)} alt="" fill className="object-cover" sizes="64px" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-semibold text-brand-text">{post.title}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-brand-muted">{post.readTime}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <AdminBadge variant="purple">{post.category}</AdminBadge>
                  </td>
                  <td className="py-4 pr-4 text-brand-muted">{post.date}</td>
                  <td className="py-4 pr-4">
                    <AdminBadge variant={post.status === "published" ? "success" : "warning"}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </AdminBadge>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(post)}
                        disabled={deletingId === post.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === post.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 ? (
            <p className="py-10 text-center text-sm text-brand-muted">No posts match your search.</p>
          ) : null}
        </div>
      </AdminCard>
    </>
  );
}
