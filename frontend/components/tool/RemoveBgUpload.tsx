"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Timer,
  Upload,
  Zap,
} from "lucide-react";
import { removeBackground } from "@/services/api";
import { ProcessingAnimation, ProcessingErrorCard } from "@/components/tool/remove-bg/ProcessingAnimation";
import { ResultSection } from "@/components/tool/remove-bg/ResultSection";
import { ToolDropzoneFrame, ToolWorkspace } from "@/components/tool/ToolWorkspace";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import type { ToolPageConfig } from "@/components/tool/ToolLayout";
import { BRAND } from "@/lib/constants";

type FlowState = "idle" | "processing" | "success" | "error";

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
    setProgress(6);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        // Keep creeping while the API works so "Finishing" never looks frozen.
        if (p >= 99) return p;
        if (p >= 92) return Math.min(99, p + 0.12 + Math.random() * 0.08);
        const step = p < 40 ? 2.4 : p < 70 ? 1.4 : 0.55;
        return Math.min(92, p + step + Math.random() * 0.9);
      });
    }, 280);
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

export function RemoveBgUpload({
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
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
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
      setBackgroundUrl(null);
      setImageType(null);
      setProcessedSize(null);
      startProgress();

      try {
        const result = await removeBackground(file);
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
        setBackgroundUrl(result.background_image_url || null);
        setImageType(result.image_type || null);
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
    [clearPreviewBlob, completeProgress, resetProgress, showToast, startProgress]
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
      if (localPreviewRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  const reset = () => {
    clearPreviewBlob();
    resetProgress();
    setState("idle");
    setErrorMessage(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setBackgroundUrl(null);
    setImageType(null);
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
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === "file-too-large") showToast("Max file size is 15MB.");
      else showToast(err?.message || "Invalid file.");
    },
  });

  const downloadProcessed = async () => {
    if (!processedUrl) return;
    try {
      const res = await fetch(processedUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileInfo?.name?.replace(/\.[^.]+$/, "") || "image"}-no-bg.png`;
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
              onClick={() => open()}
              disabled={uploadLocked}
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
            Drop a photo below. Processing runs here — results appear in a dedicated section when ready.
          </p>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-brand-secondary" /> ~2s typical
            </span>
            <span>JPG · PNG · WEBP</span>
            <span>Max 15MB</span>
          </div>

          <div className="mt-8">
            <ToolDropzoneFrame active={isDragActive}>
              <div className="p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  {!showUploadContent ? (
                    <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div
                        {...getRootProps()}
                        className={cn(
                          "flex min-h-[280px] cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-10 transition-colors",
                          isDragActive
                            ? "border-brand-secondary bg-brand-secondary/10"
                            : "border-white/20 bg-white/[0.03] hover:border-brand-secondary/50"
                        )}
                      >
                        <input {...getInputProps()} aria-label={config.uploadLabel} />
                        <div className="flex h-14 w-14 items-center justify-center bg-brand-secondary text-brand-navy">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="mt-5 font-display text-xl font-bold text-white sm:text-2xl">
                          Drop your image here
                        </p>
                        <p className="mt-2 text-sm text-white/45">or click to browse · Max 15MB</p>
                        <span className="btn-gradient mt-7 inline-flex min-h-[44px] items-center px-8 text-sm font-semibold text-brand-navy">
                          Choose File
                        </span>
                      </div>

                      {config.layoutOptions?.demoChips?.length ? (
                        <div className="mt-6">
                          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                            Or try a sample
                          </p>
                          <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {config.layoutOptions.demoChips.map((chip) => (
                              <button
                                key={chip.id}
                                type="button"
                                onClick={() => void loadDemo(chip.full)}
                                disabled={uploadLocked}
                                className="group flex items-center gap-2 border border-white/12 bg-white/[0.04] px-2.5 py-1.5 transition-colors hover:border-brand-secondary/50 disabled:opacity-50"
                              >
                                <Image src={chip.thumb} alt="" width={28} height={28} className="h-7 w-7 object-cover" />
                                <span className="text-xs font-medium text-white/70 group-hover:text-brand-secondary">
                                  {chip.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : state === "processing" ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ProcessingAnimation
                        progress={progress}
                        active
                        previewUrl={localPreview}
                        hintText="Almost done — finishing your cutout"
                      />
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
                    <motion.div
                      key="uploaded"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-5 py-4 sm:flex-row sm:items-start"
                    >
                      <div className="relative h-32 w-32 shrink-0 overflow-hidden border border-white/15 sm:h-40 sm:w-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={localPreview!} alt="Uploaded preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <span className="inline-flex items-center gap-2 border border-brand-secondary/40 bg-brand-secondary/10 px-3 py-2 text-sm font-medium text-brand-secondary">
                          <CheckCircle2 className="h-4 w-4" />
                          Ready — see results below
                        </span>
                        {fileInfo && (
                          <p className="mt-3 text-sm text-white/45">
                            {fileInfo.name} · {formatBytes(fileInfo.size)}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={reset}
                          className="mt-4 text-sm font-medium text-brand-secondary underline-offset-2 hover:underline"
                        >
                          Upload a different image
                        </button>
                      </div>
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

      <AnimatePresence>
        {state === "success" && originalUrl && processedUrl && fileInfo && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultSection
              originalUrl={localPreview || originalUrl}
              processedUrl={processedUrl}
              originalSize={fileInfo.size}
              processedSize={processedSize}
              fileName={fileInfo.name}
              heroGradientClass={config.heroGradientClass}
              downloadLabel={config.downloadLabel}
              successLabel={config.successLabel}
              useCompareSlider
              originalAlt="Original uploaded image before background removal"
              processedAlt="Processed image with transparent background"
              processedLabel="Transparent PNG"
              checkerboardProcessed
              imageType={imageType}
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
