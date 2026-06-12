import type { Metadata } from "next";
import { BlogPostForm } from "@/components/admin/BlogPostForm";

export const metadata: Metadata = {
  title: "New Post | Admin",
  robots: { index: false, follow: false },
};

export default function AdminNewBlogPage() {
  return <BlogPostForm />;
}
