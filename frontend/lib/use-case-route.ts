import { createElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCaseLandingContent } from "@/components/pages/UseCaseLandingContent";
import {
  getUseCaseLanding,
  getUseCaseSlugsForPrefix,
  landingPath,
} from "@/lib/use-case-landings";

export function createUseCaseRoute(pathPrefix: string) {
  return {
    generateStaticParams() {
      return getUseCaseSlugsForPrefix(pathPrefix);
    },
    async generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
      const { slug } = await params;
      const landing = getUseCaseLanding(pathPrefix, slug);
      if (!landing) return { title: "Not found" };
      const path = landingPath(landing);
      return {
        title: landing.title,
        description: landing.description,
        keywords: [...landing.keywords],
        alternates: { canonical: path },
        openGraph: {
          title: landing.title,
          description: landing.description,
          url: path,
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: landing.title,
          description: landing.description,
        },
        robots: { index: true, follow: true },
      };
    },
    async Page({ params }: { params: Promise<{ slug: string }> }) {
      const { slug } = await params;
      const landing = getUseCaseLanding(pathPrefix, slug);
      if (!landing) notFound();
      return createElement(UseCaseLandingContent, { landing });
    },
  };
}
