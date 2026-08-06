"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Upload } from "lucide-react";
import { UPLOAD_DEMO_CHIPS, BRAND } from "@/lib/constants";
import { MOTION } from "@/lib/motion";
import { removeBackground } from "@/services/api";
import { ProcessingAnimation, ProcessingErrorCard } from "@/components/tool/remove-bg/ProcessingAnimation";
import { ResultSection } from "@/components/tool/remove-bg/ResultSection";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

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
    setProgress(8);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 99) return p;
        if (p >= 92) return Math.min(99, p + 0.12 + Math.random() * 0.08);
        return Math.min(92, p + Math.random() * 4 + 1.5);
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

export function UploadHeroCard() {
  const { showToast } = useToast();
  const [state, setState] = useState<FlowState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const lastFileRef = useRef<File | null>(null);
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
        setState("success");
        scrollTo("hero-results");
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
    scrollTo("hero-upload");
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
    const text = encodeURIComponent(`${BRAND.shortName} — Free AI Background Remover`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const showUploadContent = state !== "idle" && localPreview;
  const uploadLocked = state === "processing";

  return (
    <>
      <motion.div
        id="hero-upload"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: MOTION.scroll.duration, ease: MOTION.scroll.ease }}
        className="mx-auto w-full max-w-xl"
      >
        <div
          className={cn(
            "border border-white/15 bg-white/[0.04] backdrop-blur-sm transition-[border-color] duration-300",
            isDragActive && "border-brand-secondary"
          )}
        >
          <div className="p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {!showUploadContent ? (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex min-h-[260px] cursor-pointer flex-col items-center justify-center border border-dashed px-5 py-10 transition-colors duration-300",
                      isDragActive
                        ? "border-brand-secondary bg-brand-secondary/10"
                        : "border-white/20 bg-white/[0.03] hover:border-brand-secondary/60 hover:bg-white/[0.06]"
                    )}
                  >
                    <input {...getInputProps()} aria-label="Upload image to remove background" />
                    <div className="flex h-14 w-14 items-center justify-center rounded-md bg-brand-secondary text-brand-navy">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="mt-5 font-display text-xl font-bold text-white sm:text-2xl">
                      Drop your image here
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      or click to browse · JPG, PNG, WebP · Max 15MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        open();
                      }}
                      className="btn-gradient btn-shine mt-7 inline-flex min-h-[44px] items-center rounded-md px-8 py-3 text-sm font-semibold text-brand-navy"
                    >
                      Choose File
                    </button>
                  </div>

                  <div className="mt-6">
                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                      Try a sample
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      {UPLOAD_DEMO_CHIPS.map((chip) => (
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
                    hintText="High-quality cutout — usually ready in a few seconds"
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
                      Background removed — see results below
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
                      Upload another image
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-white/40">
          Images processed securely · Auto-deleted within 1 hour ·{" "}
          <a href="/privacy" className="underline hover:text-brand-secondary">
            Privacy Policy
          </a>
        </p>
      </motion.div>

      <AnimatePresence>
        {state === "success" && originalUrl && processedUrl && fileInfo && (
          <motion.div
            key="hero-results"
            id="hero-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10"
          >
            <ResultSection
              originalUrl={localPreview || originalUrl}
              processedUrl={processedUrl}
              originalSize={fileInfo.size}
              processedSize={processedSize}
              fileName={fileInfo.name}
              heroGradientClass="btn-gradient"
              downloadLabel="Download PNG"
              successLabel="Background removed successfully!"
              useCompareSlider
              processedLabel="Transparent PNG"
              checkerboardProcessed
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
