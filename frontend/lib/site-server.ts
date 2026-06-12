import { FAQ_ITEMS, LEGAL, TESTIMONIALS } from "@/lib/constants";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export type SiteFaqItem = {
  id: number;
  question: string;
  answer: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type SiteTestimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type SiteLegalHighlight = {
  icon: string;
  title: string;
  text: string;
};

export type SiteLegalSection = {
  id: string;
  title: string;
  contentHtml: string;
};

export type SiteLegalPage = {
  slug: string;
  pageTitle: string;
  lastUpdated: string;
  highlights: SiteLegalHighlight[];
  sections: SiteLegalSection[];
};

async function fetchFromApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getSiteFaq(): Promise<SiteFaqItem[]> {
  const data = await fetchFromApi<SiteFaqItem[]>("/api/site/faq");
  if (data?.length) return data;
  return FAQ_ITEMS.map((item, index) => ({
    id: index + 1,
    question: item.question,
    answer: item.answer,
    sortOrder: index,
    isActive: true,
  }));
}

export async function getSiteTestimonials(): Promise<SiteTestimonial[]> {
  const data = await fetchFromApi<SiteTestimonial[]>("/api/site/testimonials");
  if (data?.length) return data;
  return TESTIMONIALS.map((item, index) => ({
    id: index + 1,
    name: item.name,
    role: item.role,
    company: item.company,
    quote: item.quote,
    avatar: item.avatar,
    sortOrder: index,
    isActive: true,
  }));
}

export async function getSiteLegalPage(slug: "privacy" | "terms"): Promise<SiteLegalPage | null> {
  const data = await fetchFromApi<SiteLegalPage>(`/api/site/legal/${slug}`);
  if (data) return data;
  return null;
}

export function getLegalFallbackDate(slug: "privacy" | "terms"): string {
  return slug === "privacy" ? LEGAL.privacyLastUpdated : LEGAL.termsLastUpdated;
}
