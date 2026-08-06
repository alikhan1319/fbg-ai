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
import { TOOL_RELATED_GUIDES } from "@/lib/seo";
import { getUseCasesByTool, landingPath, type LandingToolId } from "@/lib/use-case-landings";
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
import { ToolDropzoneFrame, ToolWorkspace } from "@/components/tool/ToolWorkspace";
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

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareInstagram = () => {
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
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
    <ToolWorkspace
      aside={
        <div className="space-y-4">
          <div className="border border-white/10 bg-white/[0.04] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">
              Why this tool
            </p>
            <ul className="mt-5 space-y-4">
              {config.features.slice(0, 4).map((f, i) => (
                <li key={f.title} className="border-t border-white/10 pt-4 first:border-0 first:pt-0">
                  <p className="text-xs font-bold tabular-nums text-white/25">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">{f.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <Button
            shine
            className="btn-gradient min-h-[48px] w-full"
            onClick={() => inputRef.current?.click()}
            disabled={state === "processing"}
          >
            {config.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div>
        <p className="studio-label">Workspace</p>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Upload. Process. <span className="text-brand-secondary">Export.</span>
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
          Upload an image to see an instant preview. We support JPG, PNG, and WebP up to 15MB.
        </p>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-brand-secondary" /> ~2s typical
          </span>
          <span>JPG · PNG · WEBP</span>
          <span>Max 15MB</span>
        </div>

        {config.id === "upscale" && state !== "processing" && (
          <div className="mt-6 border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">Upscale</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setUpscale(2)}
                className={cn(
                  "min-h-[44px] border px-4 text-sm font-semibold transition-colors",
                  upscale === 2
                    ? "border-brand-secondary/40 bg-brand-secondary/10 text-brand-secondary"
                    : "border-white/12 bg-white/[0.04] text-white/70 hover:border-brand-secondary/40"
                )}
              >
                2×
              </button>
              <button
                type="button"
                onClick={() => setUpscale(4)}
                className={cn(
                  "min-h-[44px] border px-4 text-sm font-semibold transition-colors",
                  upscale === 4
                    ? "border-brand-secondary/40 bg-brand-secondary/10 text-brand-secondary"
                    : "border-white/12 bg-white/[0.04] text-white/70 hover:border-brand-secondary/40"
                )}
              >
                4×
              </button>
              <span className="ml-auto flex items-center gap-2 text-xs text-white/40">
                <Info className="h-4 w-4" />
                Best for low-res photos & logos
              </span>
            </div>
          </div>
        )}

        {config.id === "blur-bg" && state !== "processing" && (
          <div className="mt-6 border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">Blur intensity</p>
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
              <span className="w-12 text-right text-sm font-semibold text-white">{blur}</span>
            </div>
          </div>
        )}

        {config.id === "enhance" && state !== "processing" && (
          <div className="mt-6 grid gap-4 border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">Sharpen</p>
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sharp}
                  onChange={(e) => setSharp(Number(e.target.value))}
                  className="w-full accent-brand-secondary"
                  aria-label="Sharpen"
                />
                <span className="w-10 text-right text-sm font-semibold text-white">{sharp}</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">Denoise</p>
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
                <span className="w-10 text-right text-sm font-semibold text-white">{denoise}</span>
              </div>
            </div>
          </div>
        )}

        {config.id === "gen-bg" && state !== "processing" && (
          <div className="mt-6 grid gap-3 border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">Prompt</p>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 w-full border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-secondary"
                placeholder='e.g. "Cyberpunk city at night"'
                aria-label="Background prompt"
              />
              <p className="mt-2 text-xs text-white/40">
                Try: “Forest with sun rays”, “Abstract gradient”, “Studio white”.
              </p>
            </div>
            <Button
              variant="outline"
              className="min-h-[44px] border-white/20 text-white hover:bg-white/10 sm:mt-6"
              onClick={() => showToast(`Preset applied: ${prompt}`)}
            >
              Apply
            </Button>
          </div>
        )}

        <div className="mt-8">
          <ToolDropzoneFrame active={dragOver}>
            <div className="relative p-5 sm:p-7">
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
                        "flex cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-10 transition-colors",
                        config.layoutOptions?.enhancedUpload ? "min-h-[320px]" : "min-h-[260px]",
                        dragOver
                          ? "border-brand-secondary bg-brand-secondary/10"
                          : "border-white/20 bg-white/[0.03] hover:border-brand-secondary/50"
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
                      <div className="flex h-14 w-14 items-center justify-center bg-brand-secondary text-brand-navy">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="mt-5 font-display text-xl font-bold text-white sm:text-2xl">
                        Drop your image here
                      </p>
                      <p className="mt-2 text-sm text-white/45">
                        or click to browse · JPG, PNG, WebP · Max 15MB
                      </p>
                      <span className="btn-gradient mt-7 inline-flex min-h-[44px] items-center px-8 text-sm font-semibold text-brand-navy">
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
                      <div className="mt-6">
                        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                          Or try a sample
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                          {config.layoutOptions.demoChips.map((chip) => (
                            <button
                              key={chip.id}
                              type="button"
                              onClick={() => loadDemo(chip.full)}
                              className="group flex items-center gap-2 border border-white/12 bg-white/[0.04] px-2.5 py-1.5 transition-colors hover:border-brand-secondary/50"
                            >
                              <Image
                                src={chip.thumb}
                                alt=""
                                width={28}
                                height={28}
                                className="h-7 w-7 object-cover"
                              />
                              <span className="text-xs font-medium text-white/70 group-hover:text-brand-secondary">
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
                      <div className="skeleton-shimmer aspect-4/5" />
                      <div className="skeleton-shimmer aspect-4/5" />
                    </div>
                    <div className="mx-auto h-2 max-w-xs overflow-hidden bg-white/10">
                      <motion.div
                        className="h-full bg-brand-secondary"
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
                    <div className="flex items-center justify-center gap-2 text-brand-secondary">
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="font-semibold">{config.successLabel}</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="image-zoom overflow-hidden border border-white/15">
                        <div className="relative aspect-4/5 bg-white/[0.04]">
                          <Image src={preview} alt="Original image preview before processing" fill className="object-cover" sizes="500px" />
                          <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                            Before
                          </span>
                        </div>
                      </div>
                      <div className={cn("image-zoom overflow-hidden border border-white/15", config.id === "remove-bg" && "checkerboard")}>
                        <div className="relative aspect-4/5 bg-white/[0.04]">
                          <Image
                            src={preview}
                            alt="Processed result preview after applying the tool"
                            fill
                            className="object-cover"
                            sizes="500px"
                            style={processedStyle}
                          />
                          <span className={cn("absolute bottom-2 right-2 px-2 py-0.5 text-xs font-semibold text-brand-navy", config.heroGradientClass)}>
                            After
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Button shine className="btn-gradient min-h-[44px]">
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
                      <Button variant="outline" className="min-h-[44px] border-white/20 text-white hover:bg-white/10" onClick={shareInstagram}>
                        <ExternalLink className="h-4 w-4" />
                        Instagram
                      </Button>
                      <Button variant="outline" className="min-h-[44px] border-white/20 text-white hover:bg-white/10" onClick={shareFacebook}>
                        <ExternalLink className="h-4 w-4" />
                        Facebook
                      </Button>
                    </div>

                    {fileInfo && (
                      <p className="text-center text-xs text-white/40">
                        {fileInfo.name} {fileInfo.size ? `· ${formatBytes(fileInfo.size)}` : ""} · processed securely
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={reset}
                      className="mx-auto block text-sm font-medium text-brand-secondary underline-offset-2 hover:underline"
                    >
                      Upload another image
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ToolDropzoneFrame>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-secondary" /> No signup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-secondary" /> No watermark
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-brand-secondary" /> Auto-delete in 1 hour
            </span>
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
}

function ToolLandingPagesSection({ toolId }: { toolId: ToolPageConfig["id"] }) {
  const landings = getUseCasesByTool(toolId as LandingToolId);
  if (!landings.length) return null;

  return (
    <SectionShell id="use-cases-seo" ariaLabel="Popular use case landing pages" className="bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          align="left"
          className="max-w-xl"
          label="Search guides"
          title="Popular"
          highlight="use cases."
          description="Long-tail landing pages people search for — jump in, then upload in the workspace above."
        />
        <Link
          href="/use-cases"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-brand-secondary hover:underline"
        >
          View all use cases
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <StaggerGrid className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {landings.map((item, i) => (
          <StaggerGridItem key={item.slug}>
            <Link
              href={landingPath(item)}
              className="group flex h-full flex-col border border-brand-border bg-brand-bg p-5 transition-colors hover:border-brand-secondary hover:bg-white"
            >
              <span className="font-display text-xs font-bold tabular-nums text-brand-secondary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-base font-bold leading-snug text-brand-text group-hover:text-brand-secondary sm:text-lg">
                {item.h1}
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-brand-muted">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                Open guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
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
  if (!showcase.length) return null;

  const gridClass =
    columns === 3
      ? "mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
      : "mt-12 grid gap-8 md:grid-cols-2";

  return (
    <SectionShell id="showcase" ariaLabel="Before and after showcase" className="bg-brand-bg">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          label="Before / After"
          title="Proof in"
          highlight="the pixels."
          description="Drag any slider, then load that example into the workspace."
        />
      </div>

      <StaggerGrid className={gridClass}>
        {showcase.map((ex, i) => (
          <StaggerGridItem key={ex.id} className="flex flex-col">
            <div className="overflow-hidden border border-brand-border bg-[#e8eaed]">
              <CompareSlider
                before={ex.before}
                after={ex.after}
                altBefore={ex.altBefore}
                altAfter={ex.altAfter}
                transparentAfter={ex.transparentAfter}
                imageFit={ex.imageFit ?? "cover"}
                aspectClass={ex.aspectClass ?? "aspect-[3/4]"}
                className="rounded-none border-0 bg-[#e8eaed] shadow-none"
              />
            </div>

            <div className="mt-5 flex flex-1 flex-col">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-secondary">
                {String(i + 1).padStart(2, "0")} · {ex.title.split(/[—-]/)[0]?.trim() || ex.title}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold leading-snug text-brand-text">
                {ex.title.replace(/\s*[—-]\s*/, " · ")}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-brand-muted">{ex.subtitle}</p>
              <Button
                variant="outline"
                className="mt-5 min-h-[44px] w-full"
                onClick={() => {
                  onTry(ex.demoImage);
                  document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Try this image
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </StaggerGridItem>
        ))}
      </StaggerGrid>

      <p className="mt-10 text-center text-xs text-brand-muted">
        Drag the handle left and right to compare before and after
      </p>
    </SectionShell>
  );
}

function ToolHowItWorksSection({ steps }: { steps: ToolHowStep[] }) {
  return (
    <SectionShell className="bg-white" ariaLabel="How it works">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            label="Workflow"
            title="From upload"
            highlight="to export."
            description="A short path. No account wall."
          />
        </div>
        <StaggerGrid as="ol" className="space-y-0">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <StaggerGridItem key={step.title} className="list-none">
                <div className={cn("relative flex gap-5 sm:gap-7", !isLast && "pb-10")}>
                  {!isLast && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-brand-border sm:left-6" aria-hidden />
                  )}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center bg-brand-navy font-display text-sm font-bold text-brand-secondary sm:h-12 sm:w-12">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-display text-xl font-bold text-brand-text">{step.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-brand-muted">{step.description}</p>
                  </div>
                </div>
              </StaggerGridItem>
            );
          })}
        </StaggerGrid>
      </div>
    </SectionShell>
  );
}

function ToolFeaturesSection({ features }: { features: ToolFeature[] }) {
  const [primary, ...rest] = features;
  return (
    <SectionShell ariaLabel="Key features" className="bg-brand-navy">
      <SectionHeading
        light
        align="left"
        label="Highlights"
        title="Built for"
        highlight="shipping."
        description="Quality, speed, and privacy — without the SaaS tax."
      />
      <div className="mt-12 grid gap-3 lg:grid-cols-12">
        {primary && (
          <FadeInView className="border border-white/10 bg-white/[0.04] p-8 lg:col-span-5 lg:min-h-[280px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">01</span>
            <h3 className="mt-6 font-display text-2xl font-bold text-white sm:text-3xl">{primary.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">{primary.description}</p>
          </FadeInView>
        )}
        <StaggerGrid className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {rest.map((f, i) => (
            <StaggerGridItem key={f.title}>
              <article className="h-full border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-brand-secondary/40">
                <span className="font-display text-xs font-bold tabular-nums text-brand-secondary">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">{f.description}</p>
              </article>
            </StaggerGridItem>
          ))}
        </StaggerGrid>
      </div>
    </SectionShell>
  );
}

function ToolComparisonSection({ primaryKeyword }: { primaryKeyword: string }) {
  const rows = [
    { label: "Free to start", us: "Yes", them: "Limited" },
    { label: "No signup", us: "Yes", them: "Sometimes" },
    { label: "Privacy-first delete", us: "Yes", them: "Unclear" },
    { label: "Clean exports", us: "Yes", them: "Paid tier" },
    { label: "All-in-one suite", us: "6 tools", them: "Single tool" },
  ];

  return (
    <SectionShell className="bg-brand-bg" ariaLabel="Comparison">
      <SectionHeading
        align="left"
        label="Comparison"
        title={`Why ${BRAND.shortName}`}
        highlight="wins."
        description={`For “${primaryKeyword}” work: free, fast, privacy-first.`}
      />
      <FadeInView className="mt-12 grid gap-4 lg:grid-cols-2">
        <div className="border border-brand-navy bg-brand-navy p-7 text-white sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">{BRAND.shortName}</p>
          <ul className="mt-6 space-y-4">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 first:border-0 first:pt-0">
                <span className="text-sm text-white/55">{row.label}</span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4 text-brand-secondary" />
                  {row.us}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-brand-border bg-white p-7 sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-muted">Typical alternatives</p>
          <ul className="mt-6 space-y-4">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 border-t border-brand-border pt-4 first:border-0 first:pt-0">
                <span className="text-sm text-brand-muted">{row.label}</span>
                <span className="text-sm font-semibold text-brand-muted">{row.them}</span>
              </li>
            ))}
          </ul>
        </div>
      </FadeInView>
    </SectionShell>
  );
}

function ToolUseCasesSection({ cases }: { cases: ToolUseCase[] }) {
  return (
    <SectionShell ariaLabel="Use cases" className="bg-white">
      <SectionHeading
        label="Use cases"
        title="Who this is"
        highlight="for."
        description="Same tool, different jobs — creators to commerce teams."
      />
      <StaggerGrid className="mt-12 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {cases.map((c, i) => (
          <StaggerGridItem key={c.title} className="min-w-[260px] lg:min-w-0">
            <article className="flex h-full flex-col border border-brand-border bg-brand-bg p-6">
              <span className="font-display text-4xl font-bold text-brand-border">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-secondary">
                {c.iconLabel}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-text">{c.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">{c.description}</p>
            </article>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}

function ToolGuidesSection({ route }: { route: string }) {
  const key = route.replace(/^\//, "");
  const list = TOOL_RELATED_GUIDES[key] ?? [];
  if (!list.length) return null;

  return (
    <SectionShell ariaLabel="Related guides" className="bg-white">
      <SectionHeading
        align="left"
        label="Guides"
        title="Learn the"
        highlight="workflow."
        description="Practical articles that pair with this tool."
      />
      <StaggerGrid className="mt-10 divide-y divide-brand-border border-y border-brand-border">
        {list.map((g, i) => (
          <StaggerGridItem key={g.href}>
            <Link
              href={g.href}
              className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-brand-bg"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="font-display text-sm font-bold tabular-nums text-brand-secondary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-display text-lg font-bold text-brand-text group-hover:text-brand-secondary">
                  {g.title}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-brand-secondary transition-transform group-hover:translate-x-1" />
            </Link>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}

function RelatedToolsSection({
  currentId,
  intro,
}: {
  currentId: ToolPageConfig["id"];
  intro: string;
  layout?: "scroll" | "grid";
}) {
  const others = AI_TOOLS.filter((t) => t.id !== currentId);

  return (
    <SectionShell ariaLabel="Related tools" className="bg-brand-bg">
      <SectionHeading
        align="left"
        label="Related"
        title="Keep editing"
        highlight="in one place."
        description={intro}
      />
      <StaggerGrid className="mt-10 divide-y divide-brand-border border-y border-brand-border">
        {others.map((t, i) => (
          <StaggerGridItem key={t.id}>
            <Link
              href={t.route}
              className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-white"
            >
              <div className="flex min-w-0 items-start gap-4 sm:gap-6">
                <span className="font-display text-sm font-bold tabular-nums text-brand-secondary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-brand-text group-hover:text-brand-secondary">
                    {t.fullName}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-brand-muted">{t.description}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-brand-secondary transition-transform group-hover:translate-x-1" />
            </Link>
          </StaggerGridItem>
        ))}
      </StaggerGrid>
    </SectionShell>
  );
}

function ToolHero({ config }: { config: ToolPageConfig }) {
  return (
    <section className="hero-studio relative overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-12" aria-label="Hero">
      <div className="hero-studio-grain absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 85% 20%, rgba(0,191,166,0.14), transparent 55%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 sm:px-8">
        <motion.div
          variants={pageLoadContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"
        >
          <div className="max-w-2xl">
            <motion.p variants={pageLoadItem} className="studio-label">
              {config.trustLine}
            </motion.p>
            <motion.h1 variants={pageLoadItem} className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              {config.h1}
            </motion.h1>
            <motion.p variants={pageLoadItem} className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              {config.subheadline}
            </motion.p>
            <motion.div variants={pageLoadItem} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                shine
                className="btn-gradient btn-shine min-h-[48px] w-full sm:w-auto"
                onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })}
              >
                {config.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="min-h-[48px] w-full border-white/25 text-white hover:border-brand-secondary hover:bg-transparent hover:text-brand-secondary sm:w-auto"
                onClick={() => document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" })}
              >
                See examples
              </Button>
            </motion.div>
          </div>

          <motion.div
            variants={pageLoadItem}
            className="border border-white/10 bg-white/[0.04] p-6 sm:p-7"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">
              Workspace ready
            </p>
            <ul className="mt-5 space-y-4 text-sm text-white/55">
              <li className="flex items-center gap-3 border-t border-white/10 pt-4 first:border-0 first:pt-0">
                <Shield className="h-4 w-4 shrink-0 text-brand-secondary" />
                Privacy-first · auto-delete in 1 hour
              </li>
              <li className="flex items-center gap-3 border-t border-white/10 pt-4">
                <Lock className="h-4 w-4 shrink-0 text-brand-secondary" />
                No signup · no watermark on exports
              </li>
              <li className="flex items-center gap-3 border-t border-white/10 pt-4">
                <Timer className="h-4 w-4 shrink-0 text-brand-secondary" />
                Fast processing · JPG, PNG, WebP
              </li>
            </ul>
            <button
              type="button"
              onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary hover:underline"
            >
              Jump to upload
              <ArrowRight className="h-4 w-4" />
            </button>
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
        <ToolLandingPagesSection toolId={config.id} />
        <div id="showcase-anchor">
          <ToolShowcaseSection
            showcase={config.showcase}
            onTry={onTry}
            columns={config.layoutOptions?.showcaseColumns ?? 2}
          />
        </div>
        <ToolHowItWorksSection steps={config.howItWorks} />
        <ToolFeaturesSection features={config.features} />
        <ToolUseCasesSection cases={config.useCases} />
        <ToolComparisonSection primaryKeyword={config.primaryKeyword} />
        <TestimonialsSection items={testimonials} />
        <FAQSection items={faqItems} />
        <ToolGuidesSection route={config.route} />
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

