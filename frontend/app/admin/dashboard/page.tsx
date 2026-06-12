import type { Metadata } from "next";
import { DashboardContent } from "@/components/admin/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <DashboardContent />;
}
