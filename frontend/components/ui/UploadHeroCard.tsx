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
      setProgress((p) => (p >= 92 ? p : p + Math.random() * 6 + 2));
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: MOTION.scroll.duration, ease: MOTION.scroll.ease }}
        className="mx-auto w-full max-w-3xl"
      >
        <div className={cn("animated-border shadow-2xl shadow-brand-secondary/10", isDragActive && "brightness-110")}>
          <div className="animated-border-inner p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {!showUploadContent ? (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-all duration-300",
                      isDragActive
                        ? "border-brand-secondary bg-brand-secondary/5"
                        : "border-brand-border/80 bg-brand-card/40 hover:border-brand-purple/50 hover:bg-white"
                    )}
                  >
                    <input {...getInputProps()} aria-label="Upload image to remove background" />
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-secondary/15 to-brand-purple/15"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-secondary to-brand-purple text-white shadow-lg">
                        <Upload className="h-7 w-7" />
                      </div>
                    </motion.div>
                    <p className="mt-6 text-xl font-bold text-brand-text sm:text-2xl">Drop your image here</p>
                    <p className="mt-2 text-sm text-brand-muted/80">
                      or click to browse · JPG, PNG, WebP · Max 15MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        open();
                      }}
                      className="btn-gradient btn-shine mt-8 inline-flex min-h-[44px] items-center rounded-xl px-10 py-3.5 text-sm font-semibold text-white shadow-lg"
                    >
                      Choose File
                    </button>
                  </div>

                  <div className="mt-8">
                    <p className="text-center text-xs font-semibold uppercase tracking-wider text-brand-muted">
                      Try this →
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                      {UPLOAD_DEMO_CHIPS.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => void loadDemo(chip.full)}
                          disabled={uploadLocked}
                          className="group flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 shadow-sm transition-all duration-300 hover:border-brand-secondary/40 hover:shadow-md disabled:opacity-50"
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
                </motion.div>
              ) : state === "processing" ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-4"
                >
                  {localPreview && (
                    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={localPreview} alt="Uploaded preview" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="truncate text-sm font-medium text-gray-700">{fileInfo?.name}</p>
                        {fileInfo && <p className="text-xs text-gray-400">{formatBytes(fileInfo.size)}</p>}
                        <p className="mt-1 text-xs text-brand-secondary">AI is removing your background…</p>
                      </div>
                    </div>
                  )}
                  <ProcessingAnimation progress={progress} active />
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
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-gray-200 shadow-md sm:h-40 sm:w-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localPreview!} alt="Uploaded preview" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Background removed — see results below
                    </span>
                    {fileInfo && (
                      <p className="mt-3 text-sm text-gray-500">
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
        <p className="mt-5 text-center text-xs text-brand-muted/80">
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
              originalUrl={originalUrl}
              processedUrl={processedUrl}
              originalSize={fileInfo.size}
              processedSize={processedSize}
              fileName={fileInfo.name}
              heroGradientClass="btn-gradient"
              downloadLabel="Download PNG"
              successLabel="Background removed successfully!"
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
