"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { BackToTop } from "@/components/ui/BackToTop";
import { HeroSection } from "@/components/sections/HeroSection";
import { ToolsGridSection } from "@/components/sections/ToolsGridSection";
import { BeforeAfterSection } from "@/components/sections/BeforeAfterSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { KeyFeaturesSection } from "@/components/sections/KeyFeaturesSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { SeoContentSection } from "@/components/sections/SeoContentSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import type { CmsBlogPost } from "@/lib/cms-server";
import type { SiteFaqItem, SiteTestimonial } from "@/lib/site-server";

export function HomePage({
  latestPosts,
  faqItems,
  testimonials,
}: {
  latestPosts: CmsBlogPost[];
  faqItems: SiteFaqItem[];
  testimonials: SiteTestimonial[];
}) {
  return (
    <ToastProvider>
      <Navbar />
      <main className="overflow-x-clip">
        <HeroSection />
        <ToolsGridSection />
        <BeforeAfterSection />
        <HowItWorksSection />
        <KeyFeaturesSection />
        <WhyChooseUsSection />
        <StatsSection />
        <TestimonialsSection items={testimonials} />
        <FAQSection items={faqItems} />
        <SeoContentSection />
        <BlogSection posts={latestPosts} />
        <NewsletterSection />
      </main>
      <Footer />
      <BackToTop />
    </ToastProvider>
  );
}
