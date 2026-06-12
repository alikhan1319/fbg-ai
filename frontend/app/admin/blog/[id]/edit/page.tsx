import type { Metadata } from "next";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const metadata: Metadata = {
  title: "Edit Post | Admin",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditBlogPage({ params }: Props) {
  const { id } = await params;
  const postId = Number.parseInt(id, 10);
  return <BlogPostForm postId={Number.isFinite(postId) ? postId : undefined} />;
}
