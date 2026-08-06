"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  HelpCircle,
  Shield,
  Sparkles,
  Send,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { StudioPageHero } from "@/components/ui/StudioPageHero";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { useToast } from "@/components/ui/ToastProvider";
import { AI_TOOLS, BRAND, CONTACT } from "@/lib/constants";
import { PRIMARY_KEYWORD, PRIMARY_KEYWORD_TITLE } from "@/lib/seo";
import { cn } from "@/lib/utils";

const SUPPORT_TOPICS = [
  "General inquiry",
  "Background removal help",
  "Upscale / enhance tools",
  "Privacy or data request",
  "Bug report",
  "Partnership or press",
  "Feature request",
] as const;

const QUICK_HELP = [
  {
    icon: HelpCircle,
    title: "Need help removing a background?",
    text: "Most issues are solved by uploading a clear JPG or PNG under 15MB with good lighting around your subject.",
    href: "/remove-bg",
    linkLabel: "Open free background remover AI",
  },
  {
    icon: Sparkles,
    title: "Explore all six AI tools",
    text: "Upscale, blur, enhance, remove watermarks, and generate backgrounds — all free from our main platform.",
    href: "/",
    linkLabel: "Visit homepage",
  },
  {
    icon: Shield,
    title: "Privacy & data questions",
    text: "Uploads are auto-deleted within one hour. Read our policy or email our privacy team directly.",
    href: "/privacy",
    linkLabel: "Read privacy policy",
  },
] as const;

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "General support",
    detail: CONTACT.supportEmail,
    href: `mailto:${CONTACT.supportEmail}`,
    note: "Tool help, account questions, and technical issues",
  },
  {
    icon: MessageSquare,
    title: "General inquiries",
    detail: CONTACT.generalEmail,
    href: `mailto:${CONTACT.generalEmail}`,
    note: "Feedback, suggestions, and business questions",
  },
  {
    icon: Shield,
    title: "Privacy & legal",
    detail: CONTACT.privacyEmail,
    href: `mailto:${CONTACT.privacyEmail}`,
    note: "Data requests, GDPR, and policy questions",
  },
] as const;

export function ContactPageContent() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(SUPPORT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes("@") || !message.trim()) {
      showToast("Please fill in your name, a valid email, and your message.");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setName("");
      setEmail("");
      setTopic(SUPPORT_TOPICS[0]);
      setMessage("");
      showToast("Message sent! Our team will reply within 24–48 business hours.");
    }, 600);
  };

  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <StudioPageHero
          crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
          label="Get in touch"
          title={
            <>
              Contact <span className="text-brand-secondary">{PRIMARY_KEYWORD_TITLE}</span>
            </>
          }
          description={
            <>
              Have a question about our{" "}
              <Link href="/remove-bg" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                {PRIMARY_KEYWORD}
              </Link>
              , need help with any tool on our{" "}
              <Link href="/" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                homepage
              </Link>
              , or want to share feedback? Send us a message — we read every email.
            </>
          }
        >
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            <li className="border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55">
              <Clock className="mb-2 h-4 w-4 text-brand-secondary" aria-hidden />
              <strong className="block text-white">Response time</strong>
              {CONTACT.responseTime}
            </li>
            <li className="border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55">
              <Globe className="mb-2 h-4 w-4 text-brand-secondary" aria-hidden />
              <strong className="block text-white">Support hours</strong>
              {CONTACT.hours}
            </li>
            <li className="border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55">
              <Mail className="mb-2 h-4 w-4 text-brand-secondary" aria-hidden />
              <strong className="block text-white">Direct email</strong>
              <a href={`mailto:${CONTACT.supportEmail}`} className="text-brand-secondary hover:underline">
                {CONTACT.supportEmail}
              </a>
            </li>
          </ul>
        </StudioPageHero>

        <SectionShell className="bg-brand-bg" ariaLabel="Contact form">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
            <FadeInView>
              <SectionHeading
                align="left"
                label="Message"
                title="Send us a"
                highlight="note"
                description="Prefer email? Write to support anytime."
              />
            </FadeInView>
            <FadeInView>
              <form
                  onSubmit={onSubmit}
                  className="border border-brand-border bg-white p-6 sm:p-8"
                >
                  <h2 className="text-xl font-bold text-brand-text">Send us a message</h2>
                  <p className="mt-2 text-sm text-brand-muted">
                    Prefer email? Write to{" "}
                    <a href={`mailto:${CONTACT.supportEmail}`} className="font-medium text-brand-secondary hover:underline">
                      {CONTACT.supportEmail}
                    </a>
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                        Your name
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                        placeholder="Jane Creator"
                      />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                        Email address
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                        placeholder="you@example.com"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                        Topic
                      </span>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                      >
                        {SUPPORT_TOPICS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                        Message
                      </span>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        className="w-full resize-y rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-3 text-sm text-brand-text outline-none transition-colors focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                        placeholder="Tell us how we can help with background removal, upscaling, or any of our AI tools…"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gradient mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-6 text-sm font-semibold text-brand-navy disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send message"}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </FadeInView>
          </div>
        </SectionShell>

        {/* Contact channels */}
        <SectionShell className="border-y border-brand-border bg-white" ariaLabel="Contact channels">
          <SectionHeading
            label="Direct contact"
            title="Reach our"
            highlight="team"
            description="Choose the channel that fits your question. All messages go to real people on the FBG AI support team."
          />
          <StaggerGrid className="mt-14 grid gap-3 md:grid-cols-3">
            {CONTACT_CHANNELS.map(({ icon: Icon, title, detail, href, note }) => (
              <StaggerGridItem key={title}>
                <a
                  href={href}
                  className="group flex h-full flex-col border border-brand-border bg-brand-bg p-6 transition-colors hover:border-brand-navy hover:bg-brand-navy"
                >
                  <div className="flex h-10 w-10 items-center justify-center bg-brand-secondary text-brand-navy">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display font-bold text-brand-text transition-colors group-hover:text-white">{title}</h3>
                  <p className="mt-2 break-all text-sm font-semibold text-brand-secondary group-hover:underline">
                    {detail}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted transition-colors group-hover:text-white/50">{note}</p>
                </a>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        {/* Quick help */}
        <SectionShell ariaLabel="Quick help" className="bg-brand-bg">
          <SectionHeading
            align="left"
            label="Before you write"
            title="Quick"
            highlight="help"
            description="Many questions are answered instantly on our tool pages — no wait required."
          />
          <div className="mt-12 grid gap-3 lg:grid-cols-3">
            {QUICK_HELP.map(({ icon: Icon, title, text, href, linkLabel }) => (
              <FadeInView key={title}>
                <div className="h-full border border-brand-border bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center bg-brand-secondary/15 text-brand-secondary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display font-bold text-brand-text">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{text}</p>
                  <Link
                    href={href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary hover:underline"
                  >
                    {linkLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeInView>
            ))}
          </div>
        </SectionShell>

        {/* Tools links for SEO */}
        <SectionShell className="bg-white" ariaLabel="Tool support links">
          <SectionHeading
            label="Tool support"
            title="Get help with"
            highlight="any AI tool"
            description="Each tool page includes upload tips, FAQs, and live examples."
          />
          <StaggerGrid className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool) => (
              <StaggerGridItem key={tool.id}>
                <Link
                  href={tool.route}
                  className={cn(
                    "group flex items-center justify-between border bg-brand-bg px-5 py-4 transition-colors hover:border-brand-navy hover:bg-brand-navy",
                    tool.id === "remove-bg" ? "border-brand-secondary" : "border-brand-border"
                  )}
                >
                  <div>
                    <p className="font-semibold text-brand-text transition-colors group-hover:text-white">{tool.fullName}</p>
                    <p className="mt-0.5 text-xs text-brand-muted transition-colors group-hover:text-white/40">{tool.route}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-brand-secondary" />
                </Link>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        <section className="bg-brand-navy py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-6 text-center sm:px-8">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Rather try the tool first?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/55">
              Skip the wait — upload on our free background remover or explore the full suite.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/remove-bg"
                className="btn-gradient inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-6 text-sm font-semibold text-brand-navy sm:w-auto"
              >
                Remove background free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`mailto:${CONTACT.supportEmail}`}
                className="inline-flex min-h-[48px] w-full items-center justify-center border border-white/25 px-6 text-sm font-semibold text-white hover:border-brand-secondary hover:text-brand-secondary sm:w-auto"
              >
                Email support
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
