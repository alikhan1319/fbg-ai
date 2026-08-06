"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Cookie,
  Database,
  Eye,
  Lock,
  Shield,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { BRAND, CONTACT, LEGAL } from "@/lib/constants";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";

const HIGHLIGHTS = [
  {
    icon: Trash2,
    title: "Auto-delete uploads",
    text: "Images you upload for background removal, upscaling, and other AI tools are automatically deleted within 1 hour.",
  },
  {
    icon: Eye,
    title: "No model training",
    text: "We do not use your uploaded photos to train AI models without your explicit consent.",
  },
  {
    icon: Lock,
    title: "Encrypted in transit",
    text: "Files are transferred over HTTPS/TLS. Processing happens on secure servers with access controls.",
  },
  {
    icon: UserCheck,
    title: "Your rights respected",
    text: "Request access, correction, or deletion of personal data by emailing our privacy team anytime.",
  },
] as const;

const TOC = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "uploaded-images", label: "Uploaded images & AI processing" },
  { id: "how-we-use", label: "How we use information" },
  { id: "cookies", label: "Cookies & analytics" },
  { id: "retention", label: "Data retention" },
  { id: "sharing", label: "Third-party sharing" },
  { id: "your-rights", label: "Your privacy rights" },
  { id: "security", label: "Security" },
  { id: "children", label: "Children's privacy" },
  { id: "international", label: "International users" },
  { id: "changes", label: "Policy changes" },
  { id: "contact", label: "Contact us" },
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

export function PrivacyPageContent() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        {/* Hero */}
        <section className="bg-brand-navy relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-secondary/15 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden />

          <div className="relative mx-auto w-full max-w-[1280px] px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
              <Link href="/" className="font-medium transition-colors hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <span className="font-semibold text-brand-text">Privacy Policy</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <span className="inline-flex items-center gap-2 studio-label">
                <Shield className="h-3.5 w-3.5" aria-hidden />
                Privacy-first platform
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl">
                Privacy Policy for{" "}
                <span className="text-brand-secondary">{PRIMARY_KEYWORD_TITLE}</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-brand-muted">
                This policy explains how {BRAND.name} handles your data when you use our{" "}
                <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                  {PRIMARY_KEYWORD}
                </Link>
                , upscale images, enhance photos, and other tools on our{" "}
                <Link href="/" className="font-semibold text-brand-secondary hover:underline">
                  free AI homepage
                </Link>
                . We built {BRAND.shortName} so you can edit images without giving up control of your content.
              </p>
              <p className="mt-4 text-sm font-medium text-brand-muted">
                Last updated: {LEGAL.privacyLastUpdated}
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h2 className="mt-4 font-bold text-brand-text">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{text}</p>
                </div>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        {/* Policy body */}
        <SectionShell className="pb-28 sm:pb-32" ariaLabel="Privacy policy">
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
              <PolicySection id="introduction" title="1. Introduction">
                <p>
                  {BRAND.name} (&quot;{BRAND.shortName}&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates
                  an online AI image editing platform available at our website. This Privacy Policy describes how we
                  collect, use, store, and protect information when you visit our site or use any of our six free AI
                  tools — including our flagship{" "}
                  <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                    background remover
                  </Link>
                  .
                </p>
                <p>
                  By using our services, you agree to the practices described here. If you do not agree, please do not
                  use the platform. For questions, contact{" "}
                  <a href={`mailto:${CONTACT.privacyEmail}`} className="font-semibold text-brand-secondary hover:underline">
                    {CONTACT.privacyEmail}
                  </a>
                  .
                </p>
              </PolicySection>

              <PolicySection id="information-we-collect" title="2. Information we collect">
                <p>
                  <strong className="text-brand-text">Information you provide:</strong> When you contact us via our{" "}
                  <Link href="/contact" className="font-semibold text-brand-secondary hover:underline">
                    contact page
                  </Link>
                  , subscribe to our newsletter, or email support, we may collect your name, email address, message
                  content, and any other details you choose to share.
                </p>
                <p>
                  <strong className="text-brand-text">Uploaded images:</strong> When you use our AI tools, you may
                  upload photos (JPG, PNG, WebP). These files are processed to deliver your requested result — for
                  example, removing a background or upscaling resolution.
                </p>
                <p>
                  <strong className="text-brand-text">Usage data:</strong> We automatically collect technical
                  information such as browser type, device type, operating system, referring URLs, pages viewed, and
                  approximate location (country/region level) through standard server logs and analytics tools.
                </p>
                <p>
                  <strong className="text-brand-text">Cookies:</strong> We use cookies and similar technologies as
                  described in Section 5 below.
                </p>
              </PolicySection>

              <PolicySection id="uploaded-images" title="3. Uploaded images & AI processing">
                <p>
                  Your privacy is central to how we built {PRIMARY_KEYWORD_TITLE}. When you upload an image:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Files are transmitted securely over encrypted HTTPS connections.</li>
                  <li>
                    Images are processed solely to perform the AI task you selected (background removal, upscale,
                    enhance, blur, watermark removal, or background generation).
                  </li>
                  <li>
                    <strong className="text-brand-text">Automatic deletion:</strong> Uploaded files and generated
                    outputs are automatically deleted from our processing servers within{" "}
                    <strong className="text-brand-text">1 hour</strong>, unless a shorter window applies for a
                    specific tool.
                  </li>
                  <li>
                    We do <strong className="text-brand-text">not</strong> use your uploaded images to train machine
                    learning models without your explicit, informed consent.
                  </li>
                  <li>
                    We do <strong className="text-brand-text">not</strong> sell, rent, or license your uploaded photos
                    to third parties for advertising or marketing.
                  </li>
                </ul>
                <p>
                  Only upload images you have the legal right to edit. Do not upload content containing sensitive
                  personal data of others without their permission.
                </p>
              </PolicySection>

              <PolicySection id="how-we-use" title="4. How we use your information">
                <p>We use collected information to:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Provide, operate, and improve our AI image editing tools.</li>
                  <li>Respond to support requests and contact form submissions.</li>
                  <li>Send newsletter or product updates if you have opted in (you may unsubscribe anytime).</li>
                  <li>Monitor site performance, diagnose errors, and prevent abuse or fraud.</li>
                  <li>Comply with legal obligations and enforce our Terms of Service.</li>
                </ul>
                <p>
                  Learn more about our platform on the{" "}
                  <Link href="/about" className="font-semibold text-brand-secondary hover:underline">
                    About {PRIMARY_KEYWORD_TITLE} page
                  </Link>
                  .
                </p>
              </PolicySection>

              <PolicySection id="cookies" title="5. Cookies & analytics">
                <p>
                  We use essential cookies required for site functionality (such as remembering cookie consent
                  preferences). With your consent, we may also use analytics cookies to understand how visitors use our
                  site — for example, which tools are most popular.
                </p>
                <p>
                  You can manage cookie preferences through our cookie consent banner when you first visit the site.
                  Most browsers also allow you to block or delete cookies through settings.
                </p>
                <p className="flex items-start gap-2 rounded-xl bg-brand-card/80 p-4 text-sm">
                  <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                  <span>
                    Disabling essential cookies may limit certain features but will not prevent you from using our core
                    free AI tools.
                  </span>
                </p>
              </PolicySection>

              <PolicySection id="retention" title="6. Data retention">
                <p>
                  <strong className="text-brand-text">Uploaded images:</strong> Deleted within 1 hour of processing as
                  described above.
                </p>
                <p>
                  <strong className="text-brand-text">Contact & support messages:</strong> Retained as long as needed to
                  resolve your inquiry and for a reasonable period afterward for record-keeping (typically up to 24
                  months unless law requires longer retention).
                </p>
                <p>
                  <strong className="text-brand-text">Analytics data:</strong> Aggregated and anonymized where possible;
                  raw logs are retained for a limited period (typically 90 days) before deletion or anonymization.
                </p>
              </PolicySection>

              <PolicySection id="sharing" title="7. Third-party sharing">
                <p>
                  We do not sell your personal information. We may share limited data with trusted service providers
                  who help us operate the platform, such as:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Cloud hosting and infrastructure providers</li>
                  <li>Analytics services (only with consent where required)</li>
                  <li>Email delivery services for support and newsletter communications</li>
                </ul>
                <p>
                  These providers are contractually required to protect your data and use it only for the services they
                  perform for us. We may also disclose information if required by law, court order, or to protect the
                  rights and safety of {BRAND.shortName}, our users, or the public.
                </p>
              </PolicySection>

              <PolicySection id="your-rights" title="8. Your privacy rights">
                <p>
                  Depending on your location, you may have rights including access, correction, deletion, restriction of
                  processing, data portability, and objection to certain uses of your personal data.
                </p>
                <p>
                  To exercise these rights, email{" "}
                  <a href={`mailto:${CONTACT.privacyEmail}`} className="font-semibold text-brand-secondary hover:underline">
                    {CONTACT.privacyEmail}
                  </a>{" "}
                  with your request. We will respond within the timeframe required by applicable law (typically 30
                  days). You may also lodge a complaint with your local data protection authority.
                </p>
                <p>
                  If you are in the European Economic Area (EEA) or United Kingdom, we process personal data based on
                  legitimate interests, contractual necessity, consent (where applicable), and legal obligations.
                </p>
              </PolicySection>

              <PolicySection id="security" title="9. Security">
                <p>
                  We implement industry-standard safeguards including TLS encryption in transit, access controls,
                  secure server environments, and regular monitoring. No method of transmission or storage is 100%
                  secure; we cannot guarantee absolute security but we work continuously to protect your information.
                </p>
                <p>
                  If you believe your interaction with us is no longer secure, please notify us immediately at{" "}
                  <a href={`mailto:${CONTACT.privacyEmail}`} className="font-semibold text-brand-secondary hover:underline">
                    {CONTACT.privacyEmail}
                  </a>
                  .
                </p>
              </PolicySection>

              <PolicySection id="children" title="10. Children's privacy">
                <p>
                  Our services are not directed to children under 13 (or 16 in certain jurisdictions). We do not
                  knowingly collect personal information from children. If you believe a child has provided us with
                  personal data, contact us and we will promptly delete it.
                </p>
              </PolicySection>

              <PolicySection id="international" title="11. International users">
                <p>
                  {BRAND.name} is operated by a remote-first team serving users worldwide. If you access our services
                  from outside your home country, your information may be processed in countries with different data
                  protection laws. We take steps to ensure appropriate safeguards are in place for cross-border
                  transfers where required.
                </p>
              </PolicySection>

              <PolicySection id="changes" title="12. Changes to this policy">
                <p>
                  We may update this Privacy Policy from time to time. When we do, we will revise the &quot;Last
                  updated&quot; date at the top of this page. Material changes may also be announced on our{" "}
                  <Link href="/" className="font-semibold text-brand-secondary hover:underline">
                    homepage
                  </Link>
                  . Continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
                <p>
                  Related documents:{" "}
                  <Link href="/terms" className="font-semibold text-brand-secondary hover:underline">
                    Terms of Service
                  </Link>
                  .
                </p>
              </PolicySection>

              <PolicySection id="contact" title="13. Contact us">
                <p>
                  For privacy-related questions, data requests, or concerns about how {PRIMARY_KEYWORD_TITLE} handles
                  your information:
                </p>
                <ul className="space-y-3 rounded-xl bg-brand-card/80 p-5">
                  <li className="flex items-start gap-3">
                    <Database className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                    <span>
                      <strong className="text-brand-text">Privacy team:</strong>{" "}
                      <a href={`mailto:${CONTACT.privacyEmail}`} className="font-semibold text-brand-secondary hover:underline">
                        {CONTACT.privacyEmail}
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                    <span>
                      <strong className="text-brand-text">Response time:</strong> {CONTACT.responseTime}
                    </span>
                  </li>
                </ul>
                <p>
                  You can also reach us through our{" "}
                  <Link href="/contact" className="font-semibold text-brand-secondary hover:underline">
                    contact page
                  </Link>{" "}
                  or try our tools directly on the{" "}
                  <Link href="/remove-bg" className="font-semibold text-brand-secondary hover:underline">
                    free background remover AI
                  </Link>{" "}
                  page — no account required.
                </p>
              </PolicySection>
            </FadeInView>
          </div>

          {/* CTA */}
          <FadeInView className="relative mt-14 overflow-hidden  border border-white/10 bg-brand-navy px-8 py-12 text-center   sm:px-12">
            <div className="pointer-events-none absolute inset-0 " aria-hidden />
            <div className="relative">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Ready to edit with confidence?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Use {PRIMARY_KEYWORD_TITLE} knowing your uploads are processed securely and deleted automatically.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/remove-bg"
                  className="btn-ripple btn-gradient btn-shine inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-brand-navy sm:w-auto"
                >
                  Try background remover
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
