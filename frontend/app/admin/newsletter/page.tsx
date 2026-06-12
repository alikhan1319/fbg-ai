import type { Metadata } from "next";
import { NewsletterContent } from "@/components/admin/NewsletterContent";

export const metadata: Metadata = {
  title: "Newsletter | Admin",
  robots: { index: false, follow: false },
};

export default function AdminNewsletterPage() {
  return <NewsletterContent />;
}
