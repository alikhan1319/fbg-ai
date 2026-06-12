"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminShell";
import { WordPressEditor } from "@/components/admin/WordPressEditor";
import { AI_TOOLS } from "@/lib/constants";
import { BLOG_CATEGORIES, READ_TIME_OPTIONS, slugifyTitle } from "@/lib/admin-blog";
import { resolveBlogImage } from "@/lib/media-url";
import { API_URL } from "@/services/cmsApi";
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  fetchAdminBlogCategories,
  fetchAdminBlogPost,
  updateAdminBlogPost,
  uploadBlogImage,
} from "@/services/cmsApi";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  postId?: number;
};

export function BlogPostForm({ postId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(postId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<string[]>([...BLOG_CATEGORIES]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Guides");
  const [readTime, setReadTime] = useState("5 min read");
  const [toolLink, setToolLink] = useState("/remove-bg");
  const [image, setImage] = useState("");
  const [contentHtml, setContentHtml] = useState("<p></p>");
  const [status, setStatus] = useState("published");

  useEffect(() => {
    fetchAdminBlogCategories()
      .then((rows) => {
        const merged = [...new Set([...BLOG_CATEGORIES, ...rows])].sort();
        setCategories(merged);
      })
      .catch(() => setCategories([...BLOG_CATEGORIES]));
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setSlug(slugifyTitle(title));
    }
  }, [title, isEdit]);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetchAdminBlogPost(postId)
      .then((post) => {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt);
        setCategory(post.category);
        setReadTime(post.readTime);
        setToolLink(post.toolLink);
        setImage(post.image);
        setStatus(post.status);
        setContentHtml(
          (post.contentHtml || "<p></p>").replace(
            /src="(\/blog-media\/[^"]+)"/g,
            (_, path) => `src="${resolveBlogImage(path)}"`
          )
        );
      })
      .catch((err: Error) => showToast(err.message))
      .finally(() => setLoading(false));
  }, [postId, showToast]);

  const onFeaturedImageSelect = async (file: File | undefined) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const { url } = await uploadBlogImage(file);
      setImage(url);
      showToast("Featured image uploaded.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const buildPayload = () => ({
    title: title.trim(),
    slug: slugifyTitle(slug || title),
    excerpt: excerpt.trim(),
    category,
    read_time: readTime,
    tool_link: toolLink,
    image,
    image_alt: title.trim(),
    status,
    content_html: contentHtml.replace(
      new RegExp(`${API_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/blog-media/`, "g"),
      "/blog-media/"
    ),
    sections: [],
  });

  const onSave = async () => {
    if (!title.trim()) {
      showToast("Meta title is required.");
      return;
    }
    if (!excerpt.trim()) {
      showToast("Meta description is required.");
      return;
    }
    if (!image.trim()) {
      showToast("Please upload a featured image.");
      return;
    }
    const plain = contentHtml.replace(/<[^>]+>/g, "").trim();
    if (!plain) {
      showToast("Please write some blog content.");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit && postId) {
        const result = await updateAdminBlogPost(postId, payload);
        if (result?.newsletterSent && result.newsletterSent > 0) {
          showToast(`Post published. Newsletter sent to ${result.newsletterSent} subscribers.`);
        } else {
          showToast("Post updated successfully.");
        }
      } else {
        const result = await createAdminBlogPost(payload);
        if (result?.newsletterSent && result.newsletterSent > 0) {
          showToast(`Post published. Newsletter sent to ${result.newsletterSent} subscribers.`);
        } else if (payload.status === "published") {
          showToast("Post published. Configure SMTP in backend .env to email subscribers.");
        } else {
          showToast("Draft saved successfully.");
        }
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!postId || !confirm("Delete this post permanently?")) return;
    setSaving(true);
    try {
      const result = await deleteAdminBlogPost(postId);
      if (!result?.status || result.status !== "deleted") {
        throw new Error("Delete failed. The post was not removed from the database.");
      }
      showToast("Post deleted.");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
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
        title={isEdit ? "Edit blog post" : "New blog post"}
        description="Simple WordPress-style editor — 100% free, no API keys, stored in MySQL."
        action={
          <Link
            href="/admin/blog"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-text hover:border-brand-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to list
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <AdminCard title="Post details">
            <div className="space-y-5">
              <Field label="Meta title" hint="The main heading shown on the blog page and in search results.">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="How to remove backgrounds for product photos"
                  className={inputClass}
                />
              </Field>

              <Field label="URL slug" hint="Auto-generated from meta title — used in the blog link.">
                <input value={slug} readOnly className={`${inputClass} bg-brand-bg text-brand-muted`} />
              </Field>

              <Field label="Meta description" hint="Short summary for SEO and the blog card excerpt.">
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  maxLength={320}
                  placeholder="Step-by-step guide to clean white backgrounds for e-commerce..."
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-brand-muted">{excerpt.length}/320 characters</p>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Read time">
                  <select value={readTime} onChange={(e) => setReadTime(e.target.value)} className={inputClass}>
                    {READ_TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Featured image" hint="Upload the main cover image for this blog post.">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => onFeaturedImageSelect(e.target.files?.[0])}
                />
                {image ? (
                  <div className="relative overflow-hidden rounded-xl border border-brand-border">
                    <div className="relative aspect-[16/10] bg-brand-card">
                      <Image src={resolveBlogImage(image)} alt="" fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex gap-2 border-t border-brand-border bg-brand-bg/50 p-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-3 py-1.5 text-xs font-semibold hover:border-brand-secondary"
                      >
                        {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        Replace image
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex min-h-[160px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-brand-border bg-brand-bg/40 text-brand-muted transition-colors hover:border-brand-secondary hover:text-brand-secondary"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-sm font-semibold">Click to upload featured image</span>
                        <span className="text-xs">JPG, PNG, WebP or GIF · max 5 MB</span>
                      </>
                    )}
                  </button>
                )}
              </Field>

              <Field label="Tool link" hint="Which AI tool should readers try after this article?">
                <select value={toolLink} onChange={(e) => setToolLink(e.target.value)} className={inputClass}>
                  {AI_TOOLS.map((tool) => (
                    <option key={tool.id} value={tool.route}>
                      {tool.fullName}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="Content" description="WordPress-style editor — bold, headings, lists, links, images. Free forever.">
            <WordPressEditor
              content={contentHtml}
              onChange={setContentHtml}
              onUploadError={(msg) => showToast(msg)}
            />
          </AdminCard>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <AdminCard title="Publish">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Update post" : "Publish post"}
            </button>
            {isEdit ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete post
              </button>
            ) : null}
          </AdminCard>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-brand-text">{label}</span>
      {hint ? <span className="mb-2 block text-xs text-brand-muted">{hint}</span> : null}
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-text outline-none transition-colors focus:border-brand-secondary";
