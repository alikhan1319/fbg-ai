"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Info,
  Lock,
  Shield,
  Sparkles,
  Star,
  Timer,
  Upload,
  Zap,
} from "lucide-react";
import { AI_TOOLS, BRAND } from "@/lib/constants";
import { MOTION, pageLoadContainer, pageLoadItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider, useToast } from "@/components/ui/ToastProvider";
import { BackToTop } from "@/components/ui/BackToTop";
import { Button } from "@/components/ui/Button";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { FadeInView, PremiumCard, StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { RemoveBgUpload } from "@/components/tool/RemoveBgUpload";
import { UpscaleUpload } from "@/components/tool/UpscaleUpload";
import { GenerateBackgroundUpload } from "@/components/tool/GenerateBackgroundUpload";
import { RemoveWatermarkUpload } from "@/components/tool/RemoveWatermarkUpload";
import { BlurBackgroundUpload } from "@/components/tool/BlurBackgroundUpload";
import { EnhanceImageUpload } from "@/components/tool/EnhanceImageUpload";
import type { SiteFaqItem, SiteTestimonial } from "@/lib/site-server";

type ToolFeature = { title: string; description: string };
type ToolDemoChip = { id: string; label: string; thumb: string; full: string };

export type ToolLayoutOptions = {
  hideAdsSidebar?: boolean;
  enhancedUpload?: boolean;
  useLiveApi?: boolean;
  showcaseColumns?: 2 | 3;
  relatedToolsLayout?: "scroll" | "grid";
  demoChips?: ToolDemoChip[];
};
type ToolShowcase = {
  id: string;
  title: string;
  subtitle: string;
  before: string;
  after: string;
  altBefore: string;
  altAfter: string;
  transparentAfter?: boolean;
  imageFit?: "contain" | "cover";
  aspectClass?: string;
  demoImage: string;
};
type ToolUseCase = { title: string; description: string; iconLabel: string };
type ToolHowStep = { title: string; description: string };

export type ToolPageConfig = {
  id: (typeof AI_TOOLS)[number]["id"];
  route: (typeof AI_TOOLS)[number]["route"];
  primaryKeyword: string;
  h1: string;
  subheadline: string;
  ctaLabel: string;
  trustLine: string;
  heroGradientClass: string;
  uploadLabel: string;
  processingLabel: string;
  successLabel: string;
  downloadLabel: string;
  howItWorks: ToolHowStep[];
  features: ToolFeature[];
  showcase: ToolShowcase[];
  useCases: ToolUseCase[];
  relatedIntro: string;
  layoutOptions?: ToolLayoutOptions;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)}MB`;
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${10 + (i * 5) % 80}%`,
        hue: 190 + (i * 12) % 140,
        delay: i * 0.02,
        drift: -20 + (i % 6) * 8,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-1/2 h-2 w-2 rounded-full"
          style={{ left: p.left, backgroundColor: `hsl(${p.hue} 90% 60%)` }}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.9 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-4, -120],
            x: [0, p.drift],
            scale: [0.9, 1.2, 0.8],
          }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function ToolUpload({
  config,
  registerLoadDemo,
}: {
  config: Pick<
    ToolPageConfig,
    | "id"
    | "uploadLabel"
    | "processingLabel"
    | "successLabel"
    | "downloadLabel"
    | "heroGradientClass"
    | "features"
    | "ctaLabel"
    | "layoutOptions"
  >;
  registerLoadDemo?: (fn: (url: string) => void) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<"idle" | "processing" | "success">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);

  // Tool-specific lightweight UI controls (purely front-end simulation)
  const [upscale, setUpscale] = useState<2 | 4>(2);
  const [blur, setBlur] = useState(48);
  const [sharp, setSharp] = useState(40);
  const [denoise, setDenoise] = useState(25);
  const [prompt, setPrompt] = useState("Professional studio white");

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const reset = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setFileInfo(null);
    setState("idle");
  };

  const validate = (file: File) => {
    const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const max = 15 * 1024 * 1024;
    if (!okType) {
      showToast("Only JPG, PNG, or WebP files are supported.");
      return false;
    }
    if (file.size > max) {
      showToast(`Max file size is 15MB. Your file is ${formatBytes(file.size)}.`);
      return false;
    }
    return true;
  };

  const simulate = useCallback(() => {
    setState("processing");
    setTimeout(() => setState("success"), 2200);
  }, []);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!validate(file)) return;
    setFileInfo({ name: file.name, size: file.size });
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    simulate();
  };

  const loadDemo = useCallback(
    (url: string) => {
      setFileInfo({ name: "demo-image", size: 0 });
      setPreview(url);
      setState("processing");
      setTimeout(() => setState("success"), 2000);
    },
    []
  );

  useEffect(() => {
    registerLoadDemo?.(loadDemo);
  }, [registerLoadDemo, loadDemo]);

  const tweet = () => {
    const text = encodeURIComponent(`${BRAND.shortName} — ${config.uploadLabel}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const processedStyle = useMemo(() => {
    if (config.id === "blur-bg") return { filter: `blur(${clamp(blur, 0, 100) / 12}px) saturate(1.05)` };
    if (config.id === "enhance") {
      const s = 1 + clamp(sharp, 0, 100) / 180;
      const d = clamp(denoise, 0, 100) / 140;
      return { filter: `contrast(1.08) saturate(1.12) brightness(1.02)`, transform: `scale(${s})`, opacity: 1 - d * 0.08 };
    }
    if (config.id === "upscale") return { transform: `scale(${upscale === 4 ? 1.08 : 1.04})`, filter: "contrast(1.05) saturate(1.05)" };
    if (config.id === "gen-bg") return { filter: "saturate(1.15) contrast(1.08)", transform: "scale(1.03)" };
    if (config.id === "watermark") return { filter: "contrast(1.04) saturate(1.04)" };
    return {};
  }, [config.id, blur, sharp, denoise, upscale]);

  return (
    <SectionShell id="upload" className="bg-brand-card/40" ariaLabel="Upload and preview tool">
      <div className="section-divider absolute inset-x-0 top-0" />
      <div
        className={cn(
          "grid gap-10",
          config.layoutOptions?.hideAdsSidebar
            ? "mx-auto max-w-6xl lg:grid-cols-[1.15fr_0.85fr] lg:items-start"
            : "lg:grid-cols-[1.1fr_0.9fr] lg:items-start"
        )}
      >
        <div>
          <SectionHeading
            align="left"
            label="Main tool"
            title={config.uploadLabel}
            highlight=""
            description="Upload an image to see an instant preview. We support JPG, PNG, and WebP up to 15MB."
          />

          {config.layoutOptions?.enhancedUpload && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-secondary/5 px-4 py-2 text-sm font-semibold text-brand-secondary">
                <Zap className="h-4 w-4" aria-hidden />
                ~2 seconds processing time
              </span>
              {(["JPG", "PNG", "WEBP"] as const).map((fmt) => (
                <span
                  key={fmt}
                  className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted"
                >
                  {fmt}
                </span>
              ))}
              <span className="text-xs text-brand-muted/80">max 15MB</span>
            </div>
          )}

          <div className="mt-8">
            <div className={cn("animated-border shadow-2xl shadow-brand-secondary/10", dragOver && "brightness-110")}>
              <div className="animated-border-inner relative p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {state === "idle" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <label
                        className={cn(
                          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300",
                          config.layoutOptions?.enhancedUpload ? "min-h-[320px]" : "min-h-[260px]",
                          dragOver ? "border-brand-secondary/60 bg-white" : "border-brand-border bg-white/80"
                        )}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          handleFile(e.dataTransfer.files[0] ?? null);
                        }}
                      >
                        <motion.div whileHover={{ scale: 1.06 }} className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-brand-secondary/15 to-brand-purple/15">
                          <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg", config.heroGradientClass)}>
                            <Upload className="h-7 w-7" />
                          </div>
                        </motion.div>
                        <p className="mt-6 text-xl font-bold text-brand-text sm:text-2xl">
                          Drop your image here
                        </p>
                        <p className="mt-2 text-sm text-brand-muted/80">
                          or click to browse · JPG, PNG, WebP · Max 15MB
                        </p>
                        <span className={cn("btn-shine mt-8 inline-flex min-h-[44px] items-center rounded-xl px-10 py-3.5 text-sm font-semibold text-white shadow-lg", config.heroGradientClass)}>
                          Choose File
                        </span>
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          aria-label={config.uploadLabel}
                          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                        />
                      </label>

                      {config.layoutOptions?.enhancedUpload && config.layoutOptions.demoChips?.length ? (
                        <div className="mt-8">
                          <p className="text-center text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            Or try an example
                          </p>
                          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                            {config.layoutOptions.demoChips.map((chip) => (
                              <button
                                key={chip.id}
                                type="button"
                                onClick={() => loadDemo(chip.full)}
                                className="group flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 shadow-sm transition-all duration-300 hover:border-brand-secondary/40 hover:shadow-md"
                              >
                                <Image
                                  src={chip.thumb}
                                  alt=""
                                  width={28}
                                  height={28}
                                  className="h-7 w-7 rounded-full object-cover"
                                />
                                <span className="text-xs font-medium text-brand-text group-hover:text-brand-secondary">
                                  {chip.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}

                  {state === "processing" && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6 py-6"
                    >
                      <div className="flex items-center justify-center gap-2 text-brand-secondary">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        <span className="text-sm font-semibold">{config.processingLabel}</span>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="skeleton-shimmer aspect-4/5 rounded-2xl" />
                        <div className="skeleton-shimmer aspect-4/5 rounded-2xl" />
                      </div>
                      <div className="mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-brand-card">
                        <motion.div
                          className="h-full rounded-full bg-linear-to-r from-brand-secondary to-brand-purple"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {state === "success" && preview && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative space-y-6 py-2"
                    >
                      <ConfettiBurst />
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                        <span className="font-semibold">{config.successLabel}</span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="image-zoom overflow-hidden rounded-2xl border border-brand-border">
                          <div className="relative aspect-4/5 bg-brand-card">
                            <Image src={preview} alt="Original image preview before processing" fill className="object-cover" sizes="500px" />
                            <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                              Before
                            </span>
                          </div>
                        </div>
                        <div className={cn("image-zoom overflow-hidden rounded-2xl border border-brand-border", config.id === "remove-bg" && "checkerboard")}>
                          <div className="relative aspect-4/5 bg-brand-card">
                            <Image
                              src={preview}
                              alt="Processed result preview after applying the tool"
                              fill
                              className="object-cover"
                              sizes="500px"
                              style={processedStyle}
                            />
                            <span className={cn("absolute bottom-2 right-2 rounded-md px-2 py-0.5 text-xs font-semibold text-white", config.heroGradientClass)}>
                              After
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button shine className={cn("min-h-[44px]", config.heroGradientClass)}>
                          <Download className="h-4 w-4" />
                          {config.downloadLabel}
                        </Button>
                        <Button
                          variant="secondary"
                          className="min-h-[44px]"
                          onClick={() => {
                            void navigator.clipboard.writeText(window.location.href);
                            showToast("Link copied to clipboard");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </Button>
                        <Button variant="outline" className="min-h-[44px]" onClick={tweet}>
                          <ExternalLink className="h-4 w-4" />
                          Tweet
                        </Button>
                      </div>

                      {fileInfo && (
                        <p className="text-center text-xs text-brand-muted/80">
                          {fileInfo.name} {fileInfo.size ? `· ${formatBytes(fileInfo.size)}` : ""} · processed securely
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={reset}
                        className="mx-auto block text-sm font-medium text-brand-muted transition-colors hover:text-brand-secondary"
                      >
                        Upload another image
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {config.id === "gen-bg" && state !== "processing" && (
                  <div className="mt-6 grid gap-3 rounded-2xl border border-brand-border bg-white/70 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Prompt</p>
                      <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-black/5 bg-white px-4 py-3 text-sm text-brand-text outline-none transition-all duration-300 focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20"
                        placeholder='e.g. "Cyberpunk city at night"'
                        aria-label="Background prompt"
                      />
                      <p className="mt-2 text-xs text-brand-muted/80">
                        Try: “Forest with sun rays”, “Abstract gradient”, “Studio white”.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="min-h-[44px] sm:mt-6"
                      onClick={() => showToast(`Preset applied: ${prompt}`)}
                    >
                      Apply
                    </Button>
                  </div>
                )}

                {config.id === "upscale" && state !== "processing" && (
                  <div className="mt-6 rounded-2xl border border-brand-border bg-white/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Upscale</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setUpscale(2)}
                        className={cn(
                          "min-h-[44px] rounded-xl border px-4 text-sm font-semibold transition-all duration-300",
                          upscale === 2
                            ? "border-brand-secondary/40 bg-brand-secondary/5 text-brand-secondary"
                            : "border-black/10 bg-white text-brand-text hover:border-brand-secondary/30"
                        )}
                      >
                        2×
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpscale(4)}
                        className={cn(
                          "min-h-[44px] rounded-xl border px-4 text-sm font-semibold transition-all duration-300",
                          upscale === 4
                            ? "border-brand-purple/40 bg-brand-purple/5 text-brand-purple"
                            : "border-black/10 bg-white text-brand-text hover:border-brand-purple/30"
                        )}
                      >
                        4×
                      </button>
                      <span className="ml-auto flex items-center gap-2 text-xs text-brand-muted">
                        <Info className="h-4 w-4" />
                        Best for low-res photos & logos
                      </span>
                    </div>
                  </div>
                )}

                {config.id === "blur-bg" && state !== "processing" && (
                  <div className="mt-6 rounded-2xl border border-brand-border bg-white/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Blur intensity</p>
                    <div className="mt-3 flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={blur}
                        onChange={(e) => setBlur(Number(e.target.value))}
                        className="w-full accent-brand-secondary"
                        aria-label="Blur intensity"
                      />
                      <span className="w-12 text-right text-sm font-semibold text-brand-text">{blur}</span>
                    </div>
                  </div>
                )}

                {config.id === "enhance" && state !== "processing" && (
                  <div className="mt-6 grid gap-4 rounded-2xl border border-brand-border bg-white/70 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Sharpen</p>
                      <div className="mt-2 flex items-center gap-4">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={sharp}
                          onChange={(e) => setSharp(Number(e.target.value))}
                          className="w-full accent-brand-purple"
                          aria-label="Sharpen"
                        />
                        <span className="w-10 text-right text-sm font-semibold text-brand-text">{sharp}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">Denoise</p>
                      <div className="mt-2 flex items-center gap-4">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={denoise}
                          onChange={(e) => setDenoise(Number(e.target.value))}
                          className="w-full accent-brand-accent"
                          aria-label="Denoise"
                        />
                        <span className="w-10 text-right text-sm font-semibold text-brand-text">{denoise}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {config.layoutOptions?.enhancedUpload ? (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-brand-muted/80">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5">
                  <Lock className="h-3.5 w-3.5 text-brand-purple" aria-hidden />
                  No signup required
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  No watermark on output
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5">
                  <Timer className="h-3.5 w-3.5 text-brand-accent" aria-hidden />
                  Auto-delete in 1 hour
                </span>
              </div>
            ) : (
              <p className="mt-5 text-center text-xs text-brand-muted/80">
                No signup required · Auto-deleted within 1 hour ·{" "}
                <Link href="/privacy" className="underline hover:text-brand-secondary">
                  Privacy Policy
                </Link>
              </p>
            )}
          </div>
        </div>

        {config.layoutOptions?.hideAdsSidebar ? (
          <aside className="space-y-5 lg:sticky lg:top-28">
            <PremiumCard className="p-6" glow>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Why use this tool</p>
              <ul className="mt-4 space-y-3">
                {config.features.slice(0, 4).map((f) => (
                  <li key={f.title} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{f.title}</p>
                      <p className="text-xs leading-relaxed text-brand-muted">{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </PremiumCard>
            <PremiumCard className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg", config.heroGradientClass)}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-brand-text">Privacy-first processing</p>
                  <p className="text-sm text-brand-muted">Uploads are encrypted in transit and deleted within one hour.</p>
                </div>
              </div>
            </PremiumCard>
            <Button
              shine
              className={cn("min-h-[44px] w-full", config.heroGradientClass)}
              onClick={() => inputRef.current?.click()}
            >
              {config.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </aside>
        ) : (
          <aside className="space-y-5 lg:sticky lg:top-28">
            <PremiumCard className="p-6">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg", config.heroGradientClass)}>
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-brand-text">Secure uploads</p>
                  <p className="text-sm text-brand-muted">Clear tool actions with honest, transparent labeling.</p>
                </div>
              </div>
            </PremiumCard>
            <PremiumCard className="p-6" glow>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-brand-text">Privacy-first</p>
                  <p className="text-sm text-brand-muted">Uploads expire fast. You control your files.</p>
                </div>
              </div>
            </PremiumCard>
            <PremiumCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-brand-secondary to-brand-purple text-white shadow-lg">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-brand-text">Fast processing</p>
                  <p className="text-sm text-brand-muted">Optimized for a quick first result above the fold.</p>
                </div>
              </div>
            </PremiumCard>
          </aside>
        )}
      </div>
    </SectionShell>
  );
}

function ToolShowcaseSection({
  showcase,
  onTry,
  columns = 2,
}: {
  showcase: ToolShowcase[];
  onTry: (url: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <SectionShell ariaLabel="Before and after showcase">
      <SectionHeading
        label="Before / After"
        title="Real"
        highlight="examples"
        description="Drag the slider on each example. Then click “Try this image” to load it in the tool."
      />
      <StaggerGrid
        className={cn(
          "mt-14 grid gap-8",
          columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"
        )}
      >
        {showcase.map((ex) => (
          <StaggerGridItem key={ex.id}>
            <div className="group h-full overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-4 shadow-lg backdrop-blur transition-all duration-300 hover:shadow-xl">
              <CompareSlider
                before={ex.before}
                after={ex.after}
                altBefore={ex.altBefore}
                altAfter={ex.altAfter}
                transparentAfter={ex.transparentAfter}
                imageFit={ex.imageFit}
                aspectClass={ex.aspectClass}
                className="rounded-xl shadow-none"
              />
              <div className="mt-5 flex flex-1 flex-col justify-between gap-4">
                <div>
                  <h3 className="font-bold text-brand-text">{ex.title}</h3>
                  <p className="mt-1 text-sm text-brand-muted/80">{ex.subtitle}</p>
                </div>
                <Button
                  variant="outline"
                  className="min-h-[44px] w-full sm:w-auto"
                  onClick={() => {
                    onTry(ex.demoImage);
                    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Try this image
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}

function ToolHowItWorksSection({ steps }: { steps: ToolHowStep[] }) {
  return (
    <SectionShell className="bg-brand-card" ariaLabel="How it works">
      <div className="section-divider absolute inset-x-0 top-0" />
      <SectionHeading
        label="Simple workflow"
        title="How it"
        highlight="works"
        description="A clean, repeatable workflow that keeps your results consistent."
      />

      <StaggerGrid as="ol" className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <StaggerGridItem key={step.title} className="list-none">
            <div className="luxury-card relative h-full p-6 text-center">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-brand-primary to-brand-secondary px-3 py-0.5 text-xs font-bold text-white shadow-md">
                Step {i + 1}
              </span>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-primary/10 to-brand-accent/10 text-brand-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-bold text-brand-text">{step.title}</h3>
              <p className="mt-2 text-sm text-brand-muted">{step.description}</p>
            </div>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}

function ToolFeaturesSection({ features }: { features: ToolFeature[] }) {
  return (
    <SectionShell ariaLabel="Key features">
      <SectionHeading
        label="Highlights"
        title="Key"
        highlight="features"
        description="Premium quality, precise controls, and export-ready outputs."
      />
      <StaggerGrid className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <StaggerGridItem key={f.title}>
            <PremiumCard className="h-full p-6" glow>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-brand-secondary/15 to-brand-purple/15 text-brand-secondary">
                  <Star className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-brand-text">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{f.description}</p>
                </div>
              </div>
            </PremiumCard>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}

function ToolComparisonSection({ primaryKeyword }: { primaryKeyword: string }) {
  return (
    <SectionShell className="bg-brand-card" ariaLabel="Comparison table">
      <div className="section-divider absolute inset-x-0 top-0" />
      <SectionHeading
        label="Comparison"
        title="Why choose"
        highlight={BRAND.shortName}
        description={`A modern alternative for “${primaryKeyword}” workflows: free, fast, and privacy-first.`}
      />

      <FadeInView className="mt-14 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-xl luxury-card">
        <div className="grid grid-cols-4 border-b border-brand-border bg-linear-to-r from-brand-primary/8 to-brand-accent/5 text-sm font-bold text-brand-text">
          <div className="p-4 sm:p-6">Feature</div>
          <div className="border-x border-brand-border p-4 text-center text-brand-primary sm:p-6">{BRAND.shortName}</div>
          <div className="border-r border-brand-border p-4 text-center text-brand-muted sm:p-6">remove.bg / Adobe</div>
          <div className="p-4 text-center text-brand-muted sm:p-6">Other free tools</div>
        </div>

        {[
          { label: "Free to start", us: "Yes", them: "Limited", other: "Often" },
          { label: "No signup", us: "Yes", them: "Sometimes", other: "Sometimes" },
          { label: "Privacy-first delete", us: "Yes", them: "Unclear", other: "Unclear" },
          { label: "Clean exports", us: "Yes", them: "Paid tier", other: "Watermark risk" },
          { label: "Fast LCP tool UI", us: "Optimized", them: "Varies", other: "Varies" },
          { label: "All-in-one suite", us: "6 tools", them: "Single tool", other: "Single tool" },
        ].map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-4 border-b border-brand-border text-sm transition-colors duration-300 last:border-0 hover:bg-brand-card/50"
          >
            <div className="p-4 font-medium text-brand-text sm:p-5">{row.label}</div>
            <div className="flex items-center justify-center border-x border-brand-border bg-brand-primary/5 p-4 sm:p-5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
              <span className="ml-2 hidden text-brand-text sm:inline">{row.us}</span>
            </div>
            <div className="flex items-center justify-center border-r border-brand-border p-4 text-brand-muted sm:p-5">
              {row.them}
            </div>
            <div className="flex items-center justify-center p-4 text-brand-muted sm:p-5">{row.other}</div>
          </div>
        ))}
      </FadeInView>
    </SectionShell>
  );
}

function ToolUseCasesSection({ cases }: { cases: ToolUseCase[] }) {
  return (
    <SectionShell ariaLabel="Use cases">
      <SectionHeading
        label="Who benefits"
        title="Built for"
        highlight="real work"
        description="From solo creators to teams — the workflow stays fast and consistent."
      />
      <StaggerGrid className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <StaggerGridItem key={c.title}>
            <PremiumCard className="h-full p-6">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-brand-accent/15 to-brand-secondary/15 text-brand-secondary">
                  <Info className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-brand-text">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{c.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-brand-muted/80">
                    {c.iconLabel}
                  </p>
                </div>
              </div>
            </PremiumCard>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}

function RelatedToolsSection({
  currentId,
  intro,
  layout = "scroll",
}: {
  currentId: ToolPageConfig["id"];
  intro: string;
  layout?: "scroll" | "grid";
}) {
  const others = AI_TOOLS.filter((t) => t.id !== currentId);
  const iconByTool: Record<string, React.ReactNode> = {
    "remove-bg": <Sparkles className="h-4 w-4" />,
    upscale: <Zap className="h-4 w-4" />,
    "gen-bg": <Star className="h-4 w-4" />,
    watermark: <Shield className="h-4 w-4" />,
    "blur-bg": <Info className="h-4 w-4" />,
    enhance: <CheckCircle2 className="h-4 w-4" />,
  };

  return (
    <SectionShell ariaLabel="Related tools">
      <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-brand-secondary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-brand-purple/10 blur-3xl" aria-hidden />
      <SectionHeading
        label="Related"
        title="Try more"
        highlight="tools"
        description={intro}
      />
      {layout === "grid" ? (
        <StaggerGrid className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {others.map((t) => (
            <StaggerGridItem key={t.id}>
              <Link
                href={t.route}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white/90 p-6 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-secondary/30 hover:shadow-2xl"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-secondary/15 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-secondary/15 to-brand-purple/15 text-brand-secondary">
                  {iconByTool[t.id] ?? <ArrowRight className="h-4 w-4" />}
                </div>
                <p className="text-sm font-bold text-brand-text group-hover:text-brand-secondary">{t.fullName}</p>
                <p className="mt-2 flex-1 text-sm text-brand-muted">{t.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary">
                  Open tool <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </StaggerGridItem>
          ))}
        </StaggerGrid>
      ) : (
        <div className="mt-12 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {others.map((t) => (
            <Link
              key={t.id}
              href={t.route}
              className="group relative min-w-[280px] overflow-hidden rounded-2xl border border-black/5 bg-white/95 p-6 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-secondary/30 hover:shadow-xl"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-purple/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-secondary/15 to-brand-purple/15 text-brand-secondary">
                {iconByTool[t.id] ?? <ArrowRight className="h-4 w-4" />}
              </div>
              <p className="text-sm font-bold text-brand-text group-hover:text-brand-secondary">{t.fullName}</p>
              <p className="mt-2 text-sm text-brand-muted">{t.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary">
                Open tool <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function ToolHero({ config }: { config: ToolPageConfig }) {
  return (
    <section className="hero-mesh hero-grid-dots relative overflow-hidden pt-28 pb-16" aria-label="Hero">
      <motion.div
        className="gradient-orb pointer-events-none absolute left-1/2 top-1/4 h-[520px] w-[520px] -translate-x-1/2 rounded-full"
        style={{
          background: "linear-gradient(90deg, rgba(29,78,216,0.35), rgba(139,92,246,0.35), rgba(6,182,212,0.25))",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-brand-accent/25 blur-3xl"
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 bottom-40 h-64 w-64 rounded-full bg-brand-purple/20 blur-3xl"
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 9, repeat: Infinity, delay: 1 }}
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-8">
        <motion.div variants={pageLoadContainer} initial="hidden" animate="visible" className="mx-auto max-w-4xl text-center">
          <motion.span
            variants={pageLoadItem}
            className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-4 py-2 text-xs font-semibold text-brand-secondary shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
            {config.trustLine}
          </motion.span>

          <motion.h1 variants={pageLoadItem} className="hero-headline mt-6 text-brand-text">
            {config.h1}
          </motion.h1>

          <motion.p variants={pageLoadItem} className="hero-subhead mx-auto mt-6 text-brand-muted">
            {config.subheadline}
          </motion.p>

          <motion.div variants={pageLoadItem} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              shine
              className={cn("btn-ripple min-h-[44px] w-full sm:w-auto", config.heroGradientClass)}
              onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })}
            >
              {config.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="min-h-[44px] w-full sm:w-auto"
              onClick={() => document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" })}
            >
              See examples
            </Button>
          </motion.div>

          <motion.div variants={pageLoadItem} className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-brand-muted">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 shadow-sm">
              <Shield className="h-4 w-4 text-brand-secondary" />
              Privacy-first
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 shadow-sm">
              <Lock className="h-4 w-4 text-brand-purple" />
              No signup
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 shadow-sm">
              <Timer className="h-4 w-4 text-brand-accent" />
              Fast processing
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function ToolLayout({
  config,
  testimonials,
  faqItems,
}: {
  config: ToolPageConfig;
  testimonials: SiteTestimonial[];
  faqItems: SiteFaqItem[];
}) {
  const loadDemoRef = useRef<((url: string) => void) | null>(null);
  const registerLoadDemo = useCallback((fn: (url: string) => void) => {
    loadDemoRef.current = fn;
  }, []);
  const onTry = useCallback((url: string) => {
    loadDemoRef.current?.(url);
  }, []);

  return (
    <ToastProvider>
      <Navbar />
      <main className="overflow-x-clip">
        <ToolHero config={config} />
        {config.layoutOptions?.useLiveApi && config.id === "remove-bg" ? (
          <RemoveBgUpload config={config} registerLoadDemo={registerLoadDemo} />
        ) : config.layoutOptions?.useLiveApi && config.id === "enhance" ? (
          <EnhanceImageUpload config={config} registerLoadDemo={registerLoadDemo} />
        ) : config.layoutOptions?.useLiveApi && config.id === "blur-bg" ? (
          <BlurBackgroundUpload config={config} registerLoadDemo={registerLoadDemo} />
        ) : config.layoutOptions?.useLiveApi && config.id === "upscale" ? (
          <UpscaleUpload config={config} registerLoadDemo={registerLoadDemo} />
        ) : config.layoutOptions?.useLiveApi && config.id === "gen-bg" ? (
          <GenerateBackgroundUpload config={config} registerLoadDemo={registerLoadDemo} />
        ) : config.layoutOptions?.useLiveApi && config.id === "watermark" ? (
          <RemoveWatermarkUpload config={config} registerLoadDemo={registerLoadDemo} />
        ) : (
          <ToolUpload config={config} registerLoadDemo={registerLoadDemo} />
        )}
        <ToolHowItWorksSection steps={config.howItWorks} />
        <ToolFeaturesSection features={config.features} />
        <div id="showcase">
          <ToolShowcaseSection
            showcase={config.showcase}
            onTry={onTry}
            columns={config.layoutOptions?.showcaseColumns ?? 2}
          />
        </div>
        <ToolComparisonSection primaryKeyword={config.primaryKeyword} />
        <ToolUseCasesSection cases={config.useCases} />
        <TestimonialsSection items={testimonials} />
        <FAQSection items={faqItems} />
        <RelatedToolsSection
          currentId={config.id}
          intro={config.relatedIntro}
          layout={config.layoutOptions?.relatedToolsLayout ?? "scroll"}
        />
        <NewsletterSection />
      </main>
      <Footer />
      <BackToTop />
    </ToastProvider>
  );
}

