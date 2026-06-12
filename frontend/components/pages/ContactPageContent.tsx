"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
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
        {/* Hero */}
        <section className="hero-mesh hero-grid-dots relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-accent/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-secondary/15 blur-3xl" aria-hidden />

          <div className="relative mx-auto w-full max-w-[1280px] px-8">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
              <Link href="/" className="font-medium transition-colors hover:text-brand-secondary">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              <span className="font-semibold text-brand-text">Contact</span>
            </nav>

            <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-secondary shadow-sm">
                  Get in touch
                </span>
                <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-5xl lg:text-[3.25rem]">
                  Contact{" "}
                  <span className="gradient-text-animated">{PRIMARY_KEYWORD_TITLE}</span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
                  Have a question about our{" "}
                  <Link href="/remove-bg" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                    {PRIMARY_KEYWORD}
                  </Link>
                  , need help with any tool on our{" "}
                  <Link href="/" className="font-semibold text-brand-secondary underline-offset-4 hover:underline">
                    homepage
                  </Link>
                  , or want to share feedback? Send us a message — we read every email and respond personally.
                </p>

                <ul className="mt-8 space-y-4">
                  <li className="flex items-start gap-3 text-sm text-brand-muted">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                    <span>
                      <strong className="text-brand-text">Response time:</strong> {CONTACT.responseTime}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-brand-muted">
                    <Globe className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                    <span>
                      <strong className="text-brand-text">Support hours:</strong> {CONTACT.hours}
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-brand-muted">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-secondary" aria-hidden />
                    <span>
                      <strong className="text-brand-text">Direct email:</strong>{" "}
                      <a
                        href={`mailto:${CONTACT.supportEmail}`}
                        className="font-semibold text-brand-secondary hover:underline"
                      >
                        {CONTACT.supportEmail}
                      </a>
                    </span>
                  </li>
                </ul>
              </motion.div>

              <FadeInView>
                <form
                  onSubmit={onSubmit}
                  className="luxury-card rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8"
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
                    className="btn-ripple btn-gradient btn-shine mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-secondary/25 transition-transform hover:scale-[1.01] disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send message"}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </FadeInView>
            </div>
          </div>
        </section>

        {/* Contact channels */}
        <SectionShell className="border-y border-brand-border/60 bg-brand-card/40" ariaLabel="Contact channels">
          <SectionHeading
            label="Direct contact"
            title="Reach our"
            highlight="team"
            description="Choose the channel that fits your question. All messages go to real people on the FBG AI support team."
          />
          <StaggerGrid className="mt-14 grid gap-6 md:grid-cols-3">
            {CONTACT_CHANNELS.map(({ icon: Icon, title, detail, href, note }) => (
              <StaggerGridItem key={title}>
                <a
                  href={href}
                  className="group luxury-card flex h-full flex-col rounded-2xl border border-white/70 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-secondary to-brand-purple text-white shadow-lg">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-bold text-brand-text">{title}</h3>
                  <p className="mt-2 break-all text-sm font-semibold text-brand-secondary group-hover:underline">
                    {detail}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">{note}</p>
                </a>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
        </SectionShell>

        {/* Quick help */}
        <SectionShell ariaLabel="Quick help">
          <SectionHeading
            align="left"
            label="Before you write"
            title="Quick"
            highlight="help"
            description="Many questions are answered instantly on our tool pages — no wait required."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {QUICK_HELP.map(({ icon: Icon, title, text, href, linkLabel }) => (
              <FadeInView key={title}>
                <div className="luxury-card h-full rounded-2xl border border-brand-border bg-white p-6 shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary/10 text-brand-secondary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-bold text-brand-text">{title}</h3>
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
        <SectionShell className="bg-brand-card/50" ariaLabel="Tool support links">
          <SectionHeading
            label="Tool support"
            title="Get help with"
            highlight="any AI tool"
            description="Each tool page includes upload tips, FAQs, and live examples. Start with background removal or browse the full suite."
          />
          <StaggerGrid className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS.map((tool) => (
              <StaggerGridItem key={tool.id}>
                <Link
                  href={tool.route}
                  className={cn(
                    "group flex items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm transition-all hover:border-brand-secondary/40 hover:shadow-md",
                    tool.id === "remove-bg" && "border-brand-secondary/30 bg-brand-secondary/5"
                  )}
                >
                  <div>
                    <p className="font-semibold text-brand-text group-hover:text-brand-secondary">{tool.fullName}</p>
                    <p className="mt-0.5 text-xs text-brand-muted">{tool.route}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-brand-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-secondary" />
                </Link>
              </StaggerGridItem>
            ))}
          </StaggerGrid>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-brand-muted">
            Learn more about us on the{" "}
            <Link href="/about" className="font-semibold text-brand-secondary hover:underline">
              About {PRIMARY_KEYWORD_TITLE} page
            </Link>
            .
          </p>
        </SectionShell>

        {/* CTA */}
        <SectionShell className="pb-28 sm:pb-32" ariaLabel="Try our tools">
          <FadeInView className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-navy px-8 py-14 text-center shadow-2xl sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-secondary/20 via-transparent to-brand-purple/20" aria-hidden />
            <div className="relative">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Rather try the tool first?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
                Skip the wait — upload a photo on our{" "}
                <Link href="/remove-bg" className="font-semibold text-white underline underline-offset-4 hover:text-brand-accent">
                  free background remover AI
                </Link>{" "}
                or explore every feature on the{" "}
                <Link href="/" className="font-semibold text-white underline underline-offset-4 hover:text-brand-accent">
                  {BRAND.name} homepage
                </Link>
                .
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/remove-bg"
                  className="btn-ripple btn-gradient btn-shine inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg sm:w-auto"
                >
                  Remove background free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={`mailto:${CONTACT.supportEmail}`}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
                >
                  Email {CONTACT.supportEmail}
                </a>
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
