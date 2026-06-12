import type { Metadata } from "next";
import { ContentManagementContent } from "@/components/admin/ContentManagementContent";

export const metadata: Metadata = {
  title: "Site Content | Admin",
  robots: { index: false, follow: false },
};

export default function AdminContentPage() {
  return <ContentManagementContent />;
}
