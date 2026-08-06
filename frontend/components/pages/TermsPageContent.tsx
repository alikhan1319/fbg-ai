"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  FileText,
  Gavel,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { AI_TOOLS, BRAND, CONTACT, LEGAL } from "@/lib/constants";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";

const HIGHLIGHTS = [
  {
    icon: CheckCircle2,
    title: "Free to start",
    text: "Use our background remover and five other AI tools on a generous free tier — no credit card required.",
  },
  {
    icon: ShieldCheck,
    title: "Your content, your rights",
    text: "You keep ownership of images you upload. Only submit content you have the legal right to edit and publish.",
  },
  {
    icon: Ban,
    title: "Lawful use only",
    text: "Do not upload illegal, harmful, or copyrighted material without permission. Misuse may result in access restrictions.",
  },
  {
    icon: Scale,
    title: "Fair usage limits",
    text: "Free access is subject to reasonable rate limits so the platform stays fast and available for everyone.",
  },
] as const;

const TOC = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "services", label: "Our services" },
  { id: "your-content", label: "Your content & uploads" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "free-tier", label: "Free tier & limits" },
  { id: "intellectual-property", label: "Intellectual property" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to terms" },
  { id: "contact", label: "Contact" },
] as const;

function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-brand-border/60 py-10 last:border-0">
      <h2 className="text-xl font-bold text-brand-text sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-brand-muted sm:text-base">{children}</div>
    </section>
  );
}

export function TermsPageContent() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="bg-brand-navy relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-purple/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-secondary/10 blur-3xl" aria-hidden />

          <div className="relative mx-auto w-full max-w-[1280px] px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
              <Link href="/" className="font-medium transition-colors hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <span className="font-semibold text-brand-text">Terms of Service</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 studio-label">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                Legal agreement
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl">
                Terms of Service for{" "}
                <span className="text-brand-secondary">{PRIMARY_KEYWORD_TITLE}</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-brand-muted">
                These Terms govern your use of {BRAND.name}, including our{" "}
                <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                  {PRIMARY_KEYWORD}
                </Link>
                , image upscaler, enhancer, and all tools on our{" "}
                <Link href="/" className="font-semibold text-brand-secondary hover:underline">
                  free AI homepage
                </Link>
                . Please read them carefully before uploading or processing any image.
              </p>
              <p className="mt-4 text-sm font-medium text-brand-muted">
                Last updated: {LEGAL.termsLastUpdated}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Highlights */}
        <SectionShell className="border-y border-brand-border/60 bg-brand-card/40 py-12 sm:py-14">
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <StaggerGridItem key={title}>
                <div className="border border-brand-border h-full  border border-white/70 bg-white p-5 shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h2 className="mt-4 font-bold text-brand-text">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{text}</p>
                </div>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        {/* Terms body */}
        <SectionShell className="pb-28 sm:pb-32" ariaLabel="Terms of service">
          <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <nav
                aria-label="Table of contents"
                className="sticky top-28  border border-brand-border bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">On this page</p>
                <ul className="mt-4 space-y-2">
                  {TOC.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-sm text-brand-muted transition-colors hover:text-brand-secondary"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <FadeInView className="border border-brand-border  border border-brand-border bg-white px-6 py-2   sm:px-10 sm:py-4">
              <PolicySection id="acceptance" title="1. Acceptance of terms">
                <p>
                  By accessing or using {BRAND.name} (the &quot;Service&quot;), operated by {BRAND.shortName}, you
                  agree to be bound by these Terms of Service and our{" "}
                  <Link href="/privacy" className="font-semibold text-brand-secondary hover:underline">
                    Privacy Policy
                  </Link>
                  . If you do not agree, do not use the Service.
                </p>
                <p>
                  These Terms apply to all visitors, users, and others who access the platform, including use of our{" "}
                  <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                    free background remover AI
                  </Link>{" "}
                  and related tools without creating an account.
                </p>
              </PolicySection>

              <PolicySection id="eligibility" title="2. Eligibility">
                <p>
                  You must be at least 13 years old (or the minimum age required in your jurisdiction) to use the
                  Service. If you are under 18, you represent that you have permission from a parent or legal guardian.
                </p>
                <p>
                  By using the Service, you represent that you have the legal capacity to enter into this agreement and
                  that your use complies with all applicable local, national, and international laws.
                </p>
              </PolicySection>

              <PolicySection id="services" title="3. Our services">
                <p>
                  {PRIMARY_KEYWORD_TITLE} provides free online AI image editing tools, including but not limited to:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  {AI_TOOLS.map((tool) => (
                    <li key={tool.id}>
                      <Link href={tool.route} className="font-semibold text-brand-secondary hover:underline">
                        {tool.fullName}
                      </Link>{" "}
                      — {tool.description}
                    </li>
                  ))}
                </ul>
                <p>
                  We may add, modify, suspend, or discontinue any feature at any time. We strive to maintain high
                  availability but do not guarantee uninterrupted access.
                </p>
              </PolicySection>

              <PolicySection id="your-content" title="4. Your content & uploads">
                <p>
                  <strong className="text-brand-text">Ownership:</strong> You retain all rights to images and content
                  you upload. We do not claim ownership of your original files or AI-generated outputs.
                </p>
                <p>
                  <strong className="text-brand-text">License to us:</strong> By uploading content, you grant{" "}
                  {BRAND.shortName} a limited, non-exclusive, royalty-free license to process your files solely to
                  provide the Service you requested (e.g., removing a background or upscaling an image). This license
                  ends when your files are deleted from our systems, typically within one hour as described in our{" "}
                  <Link href="/privacy" className="font-semibold text-brand-secondary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p>
                  <strong className="text-brand-text">Your responsibility:</strong> You represent that you own or have
                  the necessary rights, licenses, and permissions to upload and edit all content you submit. You are
                  solely responsible for how you use processed results.
                </p>
              </PolicySection>

              <PolicySection id="acceptable-use" title="5. Acceptable use">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Upload content you do not have the right to use, including copyrighted material without permission</li>
                  <li>Process illegal, obscene, harassing, defamatory, or harmful content</li>
                  <li>Remove watermarks or edit images when you lack legal authority to do so</li>
                  <li>Attempt to reverse-engineer, scrape, overload, or disrupt our systems or APIs</li>
                  <li>Use automated bots or scripts to exceed fair usage limits or circumvent restrictions</li>
                  <li>Impersonate others or misrepresent your affiliation with any person or entity</li>
                  <li>Violate any applicable law, regulation, or third-party rights</li>
                </ul>
                <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <span>
                    The watermark remover must only be used on images you own or are authorized to edit. Unauthorized
                    removal of third-party watermarks may violate copyright law.
                  </span>
                </p>
              </PolicySection>

              <PolicySection id="free-tier" title="6. Free tier & usage limits">
                <p>
                  {BRAND.name} offers free access to core tools subject to fair usage limits, which may include daily
                  processing caps, maximum file sizes (typically up to 25MB), and rate limiting to prevent abuse.
                </p>
                <p>
                  We reserve the right to adjust free tier limits, introduce paid plans, or modify features with
                  reasonable notice where practicable. Continued use after changes constitutes acceptance of updated
                  limits.
                </p>
                <p>
                  Free exports do not include a {BRAND.shortName} watermark on your processed images unless explicitly
                  stated otherwise for a specific feature.
                </p>
              </PolicySection>

              <PolicySection id="intellectual-property" title="7. Intellectual property">
                <p>
                  The Service, including its design, software, logos, trademarks, text, and underlying technology, is
                  owned by or licensed to {BRAND.shortName} and protected by intellectual property laws. You may not
                  copy, modify, distribute, or create derivative works of our platform except as expressly permitted.
                </p>
                <p>
                  &quot;{BRAND.name}&quot;, &quot;{BRAND.shortName}&quot;, and associated logos are our trademarks.
                  You may not use them without prior written consent.
                </p>
              </PolicySection>

              <PolicySection id="disclaimers" title="8. Disclaimers">
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                  WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p>
                  AI-generated results may contain imperfections. Edge detection, upscaling, enhancement, and other
                  outputs vary based on input quality. You are responsible for reviewing results before commercial or
                  public use.
                </p>
                <p>
                  We do not warrant that the Service will be error-free, secure, or meet your specific requirements.
                </p>
              </PolicySection>

              <PolicySection id="liability" title="9. Limitation of liability">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, {BRAND.shortName.toUpperCase()} AND ITS AFFILIATES, OFFICERS,
                  EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                  PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p>
                  OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE
                  GREATER OF (A) THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM, OR (B) FIFTY US
                  DOLLARS ($50 USD).
                </p>
                <p>
                  Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to
                  the fullest extent permitted by law.
                </p>
              </PolicySection>

              <PolicySection id="indemnification" title="10. Indemnification">
                <p>
                  You agree to indemnify, defend, and hold harmless {BRAND.shortName} and its affiliates from any
                  claims, damages, losses, or expenses (including reasonable legal fees) arising from your use of the
                  Service, your uploaded content, your violation of these Terms, or your violation of any third-party
                  rights.
                </p>
              </PolicySection>

              <PolicySection id="termination" title="11. Termination">
                <p>
                  We may suspend or terminate your access to the Service at any time, with or without notice, if we
                  believe you have violated these Terms or engaged in conduct harmful to the platform or other users.
                </p>
                <p>
                  You may stop using the Service at any time. Sections that by their nature should survive termination
                  (including disclaimers, limitation of liability, and indemnification) will remain in effect.
                </p>
              </PolicySection>

              <PolicySection id="governing-law" title="12. Governing law & disputes">
                <p>
                  These Terms are governed by applicable laws without regard to conflict-of-law principles. Any dispute
                  arising from these Terms or the Service shall first be attempted to be resolved through good-faith
                  negotiation by contacting us at{" "}
                  <a href={`mailto:${CONTACT.supportEmail}`} className="font-semibold text-brand-secondary hover:underline">
                    {CONTACT.supportEmail}
                  </a>
                  .
                </p>
                <p>
                  If informal resolution fails, disputes may be submitted to binding arbitration or courts of competent
                  jurisdiction as permitted by applicable law in your region.
                </p>
              </PolicySection>

              <PolicySection id="changes" title="13. Changes to these terms">
                <p>
                  We may update these Terms from time to time. When we do, we will revise the &quot;Last updated&quot;
                  date at the top of this page. Material changes may be communicated on our{" "}
                  <Link href="/" className="font-semibold text-brand-secondary hover:underline">
                    homepage
                  </Link>{" "}
                  or by email if you have subscribed to updates.
                </p>
                <p>
                  Related:{" "}
                  <Link href="/privacy" className="font-semibold text-brand-secondary hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  ·{" "}
                  <Link href="/about" className="font-semibold text-brand-secondary hover:underline">
                    About us
                  </Link>
                </p>
              </PolicySection>

              <PolicySection id="contact" title="14. Contact">
                <p>
                  Questions about these Terms? Contact our team:
                </p>
                <ul className="space-y-3 rounded-xl bg-brand-card/80 p-5">
                  <li className="flex items-start gap-3">
                    <Gavel className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                    <span>
                      <strong className="text-brand-text">Support:</strong>{" "}
                      <a href={`mailto:${CONTACT.supportEmail}`} className="font-semibold text-brand-secondary hover:underline">
                        {CONTACT.supportEmail}
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                    <span>
                      <strong className="text-brand-text">Contact form:</strong>{" "}
                      <Link href="/contact" className="font-semibold text-brand-secondary hover:underline">
                        {BRAND.name} contact page
                      </Link>
                    </span>
                  </li>
                </ul>
              </PolicySection>
            </FadeInView>
          </div>

          {/* CTA */}
          <FadeInView className="relative mt-14 overflow-hidden  border border-white/10 bg-brand-navy px-8 py-12 text-center   sm:px-12">
            <div className="pointer-events-none absolute inset-0 " aria-hidden />
            <div className="relative">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Agree and start editing?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                By using our tools you accept these Terms. Try the{" "}
                <Link href="/remove-bg" className="font-semibold text-white underline underline-offset-4 hover:text-brand-accent">
                  free background remover AI
                </Link>{" "}
                now — no signup required.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/remove-bg"
                  className="btn-ripple btn-gradient btn-shine inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-brand-navy sm:w-auto"
                >
                  Remove background free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </FadeInView>
        </SectionShell>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
