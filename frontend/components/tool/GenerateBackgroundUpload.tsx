"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, PaintBucket, Timer, Upload, Zap } from "lucide-react";
import { generateBackground } from "@/services/api";
import { ProcessingAnimation, ProcessingErrorCard } from "@/components/tool/remove-bg/ProcessingAnimation";
import { ResultSection } from "@/components/tool/remove-bg/ResultSection";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { PremiumCard } from "@/components/ui/motion";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import type { ToolPageConfig } from "@/components/tool/ToolLayout";
import { BRAND } from "@/lib/constants";

type FlowState = "idle" | "processing" | "success" | "error";
const SOLID_PRESETS = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#FFFFFF" },
  { label: "Blue", value: "#2563EB" },
  { label: "Red", value: "#DC2626" },
  { label: "Yellow", value: "#FACC15" },
  { label: "Green", value: "#16A34A" },
] as const;

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load demo image.");
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

function useSimulatedProgress() {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setProgress(8);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 5 + 2));
    }, 260);
  }, []);

  const complete = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  }, []);

  return { progress, start, complete, reset };
}

const GEN_BG_STATUS = [
  { threshold: 0, text: "Uploading image..." },
  { threshold: 20, text: "Removing current background..." },
  { threshold: 60, text: "Generating new background..." },
  { threshold: 100, text: "Complete!" },
];

export function GenerateBackgroundUpload({
  config,
  registerLoadDemo,
}: {
  config: Pick<
    ToolPageConfig,
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
  const { showToast } = useToast();
  const [state, setState] = useState<FlowState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [solidColor, setSolidColor] = useState("#F3F4F6");
  const lastFileRef = useRef<File | null>(null);
  const { progress, start: startProgress, complete: completeProgress, reset: resetProgress } = useSimulatedProgress();

  const scrollTo = (id: string) => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const localPreviewRef = useRef<string | null>(null);

  const setPreviewBlob = (file: File) => {
    if (localPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewRef.current);
    }
    const url = URL.createObjectURL(file);
    localPreviewRef.current = url;
    setLocalPreview(url);
  };

  const clearPreviewBlob = useCallback(() => {
    if (localPreviewRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewRef.current);
    }
    localPreviewRef.current = null;
    setLocalPreview(null);
  }, []);

  const runProcessing = useCallback(
    async (file: File) => {
      const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      const max = 15 * 1024 * 1024;
      if (!okType) {
        showToast("Only JPG, PNG, or WebP files are supported.");
        return;
      }
      if (file.size > max) {
        showToast(`Max file size is 15MB. Your file is ${formatBytes(file.size)}.`);
        return;
      }

      lastFileRef.current = file;
      clearPreviewBlob();
      setPreviewBlob(file);
      setFileInfo({ name: file.name, size: file.size });
      setState("processing");
      setErrorMessage(null);
      setOriginalUrl(null);
      setProcessedUrl(null);
      setProcessedSize(null);
      startProgress();

      try {
        const result = await generateBackground(file, {
          prompt: "",
          solidColor,
        });
        completeProgress();

        try {
          const head = await fetch(result.processed_image_url);
          const blob = await head.blob();
          setProcessedSize(blob.size);
        } catch {
          setProcessedSize(null);
        }

        setOriginalUrl(result.original_image_url);
        setProcessedUrl(result.processed_image_url);
        setState("success");
        scrollTo("results");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setErrorMessage(msg);
        setState("error");
        resetProgress();
        showToast(msg);
      }
    },
    [clearPreviewBlob, completeProgress, resetProgress, showToast, solidColor, startProgress]
  );

  const loadDemo = useCallback(
    async (url: string) => {
      try {
        const file = await urlToFile(url, "demo-image.jpg");
        await runProcessing(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not process demo image.";
        setErrorMessage(msg);
        setState("error");
        resetProgress();
        showToast(msg);
      }
    },
    [runProcessing, resetProgress, showToast]
  );

  useEffect(() => {
    registerLoadDemo?.(loadDemo);
  }, [registerLoadDemo, loadDemo]);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current?.startsWith("blob:")) URL.revokeObjectURL(localPreviewRef.current);
    };
  }, []);

  const reset = () => {
    clearPreviewBlob();
    resetProgress();
    setState("idle");
    setErrorMessage(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessedSize(null);
    setFileInfo(null);
    lastFileRef.current = null;
    scrollTo("upload");
  };

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) void runProcessing(file);
    },
    [runProcessing]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
    disabled: state === "processing",
  });

  const downloadProcessed = async () => {
    if (!processedUrl) return;
    try {
      const res = await fetch(processedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileInfo?.name?.replace(/\.[^.]+$/, "") || "image"}-generated-bg.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Download started");
    } catch {
      showToast("Download failed. Please try again.");
    }
  };

  const tweet = () => {
    const text = encodeURIComponent(`${BRAND.shortName} — ${config.uploadLabel}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const showUploadContent = state !== "idle" && localPreview;
  const uploadLocked = state === "processing";

  return (
    <>
      <SectionShell id="upload" className="bg-brand-card/40" ariaLabel="Upload image">
        <div className="section-divider absolute inset-x-0 top-0" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <SectionHeading
              align="left"
              label="Step 1"
              title="Upload your image"
              highlight=""
              description="Upload image, remove current background, then generate a clean solid-color background."
            />

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/20 bg-brand-secondary/5 px-4 py-2 text-sm font-semibold text-brand-secondary">
                <Zap className="h-4 w-4" aria-hidden />
                ~2 to 4 seconds processing
              </span>
              {(["JPG", "PNG", "WEBP"] as const).map((fmt) => (
                <span key={fmt} className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  {fmt}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-brand-border bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-text">
                <PaintBucket className="h-4 w-4 text-brand-purple" />
                Solid background color
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {SOLID_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    disabled={uploadLocked}
                    onClick={() => setSolidColor(preset.value)}
                    className={cn(
                      "min-h-[38px] rounded-lg border px-3 text-xs font-semibold transition-all",
                      solidColor.toLowerCase() === preset.value.toLowerCase()
                        ? "border-brand-secondary bg-brand-secondary/10 text-brand-secondary"
                        : "border-black/10 bg-white text-brand-text hover:border-brand-secondary/40"
                    )}
                  >
                    <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: preset.value }} />
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="color"
                  value={solidColor}
                  disabled={uploadLocked}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="h-11 w-14 rounded-lg border border-black/10 bg-white p-1"
                />
                <input
                  value={solidColor}
                  disabled={uploadLocked}
                  onChange={(e) => setSolidColor(e.target.value)}
                  className="min-h-[44px] w-40 rounded-xl border border-black/10 bg-white px-3 text-sm text-brand-text outline-none focus:border-brand-purple/40"
                />
                <p className="text-xs text-brand-muted">Or choose any custom color</p>
              </div>
            </div>

            <div className="mt-8">
              <div className={cn("animated-border shadow-2xl shadow-brand-secondary/10", isDragActive && "brightness-110")}>
                <div className="animated-border-inner p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    {!showUploadContent ? (
                      <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div
                          {...getRootProps()}
                          className={cn(
                            "flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300",
                            isDragActive ? "border-brand-secondary/60 bg-white" : "border-brand-border bg-white/80"
                          )}
                        >
                          <input {...getInputProps()} aria-label={config.uploadLabel} />
                          <motion.div whileHover={{ scale: 1.06 }} className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-brand-secondary/15 to-brand-purple/15">
                            <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg", config.heroGradientClass)}>
                              <Upload className="h-7 w-7" />
                            </div>
                          </motion.div>
                          <p className="mt-6 text-xl font-bold text-brand-text">Drop your image here</p>
                          <p className="mt-2 text-sm text-brand-muted/80">or click to browse · Max 15MB</p>
                          <span className={cn("btn-shine mt-8 inline-flex min-h-[44px] items-center rounded-xl px-10 py-3.5 text-sm font-semibold text-white shadow-lg", config.heroGradientClass)}>
                            Choose File
                          </span>
                        </div>
                      </motion.div>
                    ) : state === "processing" ? (
                      <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <ProcessingAnimation progress={progress} active statusMessages={GEN_BG_STATUS} hintText="This takes about 2–4 seconds" />
                      </motion.div>
                    ) : state === "error" && errorMessage ? (
                      <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ProcessingErrorCard
                          message={errorMessage}
                          onRetry={() => {
                            if (lastFileRef.current) void runProcessing(lastFileRef.current);
                          }}
                          onReset={reset}
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="uploaded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-3 text-center text-sm text-emerald-700">
                        <CheckCircle2 className="mx-auto mb-2 h-5 w-5" />
                        Generation complete. See result below.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-brand-muted/80">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5">
                  <Lock className="h-3.5 w-3.5 text-brand-purple" aria-hidden />
                  No signup required
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                  No watermark
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5">
                  <Timer className="h-3.5 w-3.5 text-brand-accent" aria-hidden />
                  Auto-delete in 1 hour
                </span>
              </div>
            </div>
          </div>

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
            <Button shine className={cn("min-h-[44px] w-full", config.heroGradientClass)} onClick={() => open()} disabled={uploadLocked}>
              {config.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </aside>
        </div>
      </SectionShell>

      <AnimatePresence>
        {state === "success" && originalUrl && processedUrl && fileInfo && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultSection
              originalUrl={originalUrl}
              processedUrl={processedUrl}
              originalSize={fileInfo.size}
              processedSize={processedSize}
              fileName={fileInfo.name}
              heroGradientClass={config.heroGradientClass}
              downloadLabel={config.downloadLabel}
              successLabel={config.successLabel}
              resultAriaLabel="Generated background results"
              processedLabel="Generated Background"
              originalAlt="Original uploaded image before background generation"
              processedAlt="Image with generated new background"
              checkerboardProcessed={false}
              useCompareSlider
              onReset={reset}
              onDownload={() => void downloadProcessed()}
              onCopyLink={() => {
                void navigator.clipboard.writeText(window.location.href);
                showToast("Link copied to clipboard");
              }}
              onTweet={tweet}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
