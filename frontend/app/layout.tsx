import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { ASSET_V, BRAND, SITE_URL } from "@/lib/constants";
import { HOME_SEO } from "@/lib/seo";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { PageTransition } from "@/components/layout/PageTransition";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_SEO.title,
    template: `%s | ${BRAND.shortName}`,
  },
  description: HOME_SEO.description,
  keywords: [...HOME_SEO.keywords],
  alternates: { canonical: HOME_SEO.canonical },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ASSET_V}`, sizes: "any" },
      { url: `/img/web-icon.png?v=${ASSET_V}`, type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: `/img/web-icon.png?v=${ASSET_V}`, sizes: "180x180", type: "image/png" }],
    shortcut: `/favicon.ico?v=${ASSET_V}`,
  },
  openGraph: {
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    type: "website",
    locale: "en_US",
    siteName: BRAND.name,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_SEO.title,
    description: HOME_SEO.description,
  },
  robots: { index: true, follow: true },
  verification: {
    google: "XtElp4Gn2UlkO6-GzzMCp-6eb-YUoBaLY07t1QpSnTo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${syne.variable} scroll-smooth antialiased`}>
      <body className="min-h-screen overflow-x-hidden bg-brand-bg font-sans text-brand-text">
        <ToastProvider>
          <SiteLoader />
          <PageTransition>{children}</PageTransition>
          <CookieConsent />
        </ToastProvider>
      </body>
    </html>
  );
}
