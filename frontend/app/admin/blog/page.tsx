import type { Metadata } from "next";
import { BlogManagementContent } from "@/components/admin/BlogManagementContent";

export const metadata: Metadata = {
  title: "Blog | Admin",
  robots: { index: false, follow: false },
};

export default function AdminBlogPage() {
  return <BlogManagementContent />;
}
