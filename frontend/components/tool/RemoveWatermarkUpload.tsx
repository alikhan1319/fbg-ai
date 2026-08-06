"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  MousePointer2,
  Timer,
  Upload,
  Wand2,
} from "lucide-react";
import { removeWatermark } from "@/services/api";
import { ProcessingAnimation, ProcessingErrorCard } from "@/components/tool/remove-bg/ProcessingAnimation";
import { ResultSection } from "@/components/tool/remove-bg/ResultSection";
import { ToolDropzoneFrame, ToolWorkspace } from "@/components/tool/ToolWorkspace";
import {
  WatermarkMaskEditor,
  type WatermarkMaskEditorHandle,
} from "@/components/tool/watermark/WatermarkMaskEditor";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { SectionShell } from "@/components/ui/SectionHeading";
import type { ToolPageConfig } from "@/components/tool/ToolLayout";
import { BRAND } from "@/lib/constants";

type FlowState = "idle" | "preview" | "processing" | "success" | "error";

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load demo image.");
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

/** Bake EXIF orientation so mask pixels match backend decoding. */
async function normalizeImageFile(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const mime = file.type || "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, 0.95));
  if (!blob) return file;
  return new File([blob], file.name, { type: blob.type || mime });
}

function useSimulatedProgress() {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setProgress(8);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 5 + 2));
    }, 320);
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

export function RemoveWatermarkUpload({
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
  const lastFileRef = useRef<File | null>(null);
  const maskEditorRef = useRef<WatermarkMaskEditorHandle>(null);
  const localPreviewRef = useRef<string | null>(null);
  const { progress, start: startProgress, complete: completeProgress, reset: resetProgress } =
    useSimulatedProgress();

  const scrollTo = (id: string) => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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

  const acceptFile = useCallback(
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

      let normalized = file;
      try {
        normalized = await normalizeImageFile(file);
      } catch {
        normalized = file;
      }

      lastFileRef.current = normalized;
      setPreviewBlob(normalized);
      setFileInfo({ name: normalized.name, size: normalized.size });
      setState("preview");
      setErrorMessage(null);
      setOriginalUrl(null);
      setProcessedUrl(null);
      setProcessedSize(null);
      resetProgress();
      scrollTo("mark-preview");
    },
    [resetProgress, showToast]
  );

  const runProcessing = useCallback(async () => {
    const file = lastFileRef.current;
    if (!file) return;

    if (!maskEditorRef.current?.hasMask()) {
      showToast("Paint over the watermark area you want to remove.");
      return;
    }

    let maskBlob: Blob;
    try {
      maskBlob = await maskEditorRef.current.exportMaskBlob();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Please mark the watermark first.";
      showToast(msg);
      return;
    }

    setState("processing");
    setErrorMessage(null);
    startProgress();
    scrollTo("upload");

    try {
      const result = await removeWatermark(file, maskBlob);
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
      scrollTo("mark-preview");
    }
  }, [completeProgress, resetProgress, showToast, startProgress]);

  const loadDemo = useCallback(
    async (url: string) => {
      try {
        const file = await urlToFile(url, "demo-watermark.jpg");
        await acceptFile(file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not load demo image.";
        showToast(msg);
      }
    },
    [acceptFile, showToast]
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
    setProcessedSize(null);
    setFileInfo(null);
    lastFileRef.current = null;
    scrollTo("upload");
  };

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) void acceptFile(file);
    },
    [acceptFile]
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
      a.download = `${fileInfo?.name?.replace(/\.[^.]+$/, "") || "image"}-clean.png`;
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

  const uploadLocked = state === "processing";
  const showDropzone = state === "idle";

  return (
    <>
      <ToolWorkspace
        aside={
          <div className="space-y-4">
            <div className="border border-white/10 bg-white/[0.04] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">
                How it works
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
              onClick={() => (state === "preview" ? scrollTo("mark-preview") : open())}
              disabled={uploadLocked}
            >
              {state === "preview" ? "Go to marking step" : config.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        }
      >
        <div>
          <p className="studio-label">Workspace</p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Upload. Mark. <span className="text-brand-secondary">Remove.</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
            Upload your image first. You will mark the watermark in the next step — nothing is processed until you confirm.
          </p>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
            <span className="inline-flex items-center gap-1.5">
              <MousePointer2 className="h-3.5 w-3.5 text-brand-secondary" /> Mark → then remove
            </span>
            <span>JPG · PNG · WEBP</span>
            <span>Max 15MB</span>
          </div>

          <div className="mt-8">
            <ToolDropzoneFrame active={isDragActive}>
              <div className="p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  {showDropzone ? (
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
                        <p className="mt-2 text-center text-sm text-white/45">
                          No auto-processing — you paint the watermark area first
                        </p>
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
                  ) : state === "processing" ? (
                    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      {localPreview && (
                        <div className="flex items-center gap-4 border border-white/10 bg-white/[0.04] p-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden border border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={localPreview} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-medium text-white/90">{fileInfo?.name}</p>
                            <p className="text-xs text-brand-secondary">{config.processingLabel}</p>
                          </div>
                        </div>
                      )}
                      <ProcessingAnimation progress={progress} active />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="uploaded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-4 py-2 text-center"
                    >
                      <span className="inline-flex items-center gap-2 border border-brand-secondary/40 bg-brand-secondary/10 px-3 py-2 text-sm font-medium text-brand-secondary">
                        <CheckCircle2 className="h-4 w-4" />
                        Image ready — mark the watermark below
                      </span>
                      {fileInfo && (
                        <p className="text-sm text-white/45">
                          {fileInfo.name} · {formatBytes(fileInfo.size)}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={reset}
                        className="text-sm font-medium text-brand-secondary underline-offset-2 hover:underline"
                      >
                        Upload a different image
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
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-secondary" /> Only marked area is edited
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-brand-secondary" /> Auto-delete in 1 hour
              </span>
            </div>
          </div>
        </div>
      </ToolWorkspace>

      <AnimatePresence>
        {(state === "preview" || state === "error") && localPreview && (
          <motion.div
            key="mark-preview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <SectionShell id="mark-preview" className="bg-brand-bg" ariaLabel="Mark watermark">
              <div className="mx-auto max-w-4xl">
                <p className="studio-label">Step 2</p>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
                  Mark what to <span className="text-brand-secondary">remove.</span>
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-muted">
                  Paint over the watermark or logo only. Everything outside your mark stays unchanged.
                </p>

                <div className="mt-8 border border-brand-border bg-white p-3 sm:p-4">
                  <WatermarkMaskEditor ref={maskEditorRef} imageUrl={localPreview} />
                </div>

                {state === "error" && errorMessage && (
                  <div className="mt-6">
                    <ProcessingErrorCard
                      message={errorMessage}
                      onRetry={() => void runProcessing()}
                      onReset={reset}
                    />
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    shine
                    className={cn("btn-gradient min-h-[48px] min-w-[240px] px-8", config.heroGradientClass)}
                    onClick={() => void runProcessing()}
                    disabled={uploadLocked}
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    Remove marked area
                  </Button>
                  <Button type="button" variant="outline" onClick={reset} disabled={uploadLocked}>
                    Start over
                  </Button>
                </div>
              </div>
            </SectionShell>
          </motion.div>
        )}
      </AnimatePresence>

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
