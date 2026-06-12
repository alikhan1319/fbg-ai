import { getSiteFaq, getSiteTestimonials } from "@/lib/site-server";
import { ToolFAQSchema } from "@/components/tool/ToolSchemas";
import { ToolLayout, type ToolPageConfig } from "@/components/tool/ToolLayout";

export async function ToolPageWrapper({ config }: { config: ToolPageConfig }) {
  const [testimonials, faqItems] = await Promise.all([getSiteTestimonials(), getSiteFaq()]);

  return (
    <>
      <ToolFAQSchema items={faqItems.map((item) => ({ question: item.question, answer: item.answer }))} />
      <ToolLayout config={config} testimonials={testimonials} faqItems={faqItems} />
    </>
  );
}
