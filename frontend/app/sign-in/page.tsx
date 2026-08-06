import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Sign in | ${BRAND.name}`,
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/sign-in") },
};

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 sm:px-6">
      <Link href="/" className="text-sm font-medium text-brand-secondary hover:underline">
        ← Back to home
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-brand-text">Sign in</h1>
      <p className="mt-4 text-brand-muted">
        Account sign-in is coming soon. You can use all core tools on the homepage without an account.
      </p>
    </main>
  );
}
