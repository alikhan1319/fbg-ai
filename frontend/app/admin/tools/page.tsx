import type { Metadata } from "next";
import { ToolsManagementContent } from "@/components/admin/ToolsManagementContent";

export const metadata: Metadata = {
  title: "Tools | Admin",
  robots: { index: false, follow: false },
};

export default function AdminToolsPage() {
  return <ToolsManagementContent />;
}
