import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { BRAND, SITE_URL } from "@/lib/constants";
import { HOME_SEO } from "@/lib/seo";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { PageTransition } from "@/components/layout/PageTransition";
import { SiteLoader } from "@/components/layout/SiteLoader";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} scroll-smooth antialiased`}>
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
