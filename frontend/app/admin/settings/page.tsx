import type { Metadata } from "next";
import { SettingsContent } from "@/components/admin/SettingsContent";

export const metadata: Metadata = {
  title: "Settings | Admin",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsContent />;
}
