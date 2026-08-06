"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_MESSAGES = [
  { threshold: 0, text: "Uploading" },
  { threshold: 10, text: "Detecting image type" },
  { threshold: 28, text: "Finding object vs background" },
  { threshold: 55, text: "Removing background" },
  { threshold: 78, text: "Smoothing edges" },
  { threshold: 92, text: "Finishing" },
  { threshold: 100, text: "Done" },
];

function getStatusMessage(progress: number, steps: Array<{ threshold: number; text: string }>) {
  let message = steps[0]?.text ?? "Processing";
  for (const step of steps) {
    if (progress >= step.threshold) message = step.text;
  }
  return message;
}

/** Number-first processing UI — big percent is the focus. */
export function ProcessingAnimation({
  progress,
  active,
  previewUrl,
  statusMessages = STATUS_MESSAGES,
  hintText = "Removing background…",
}: {
  progress: number;
  active: boolean;
  previewUrl?: string | null;
  statusMessages?: Array<{ threshold: number; text: string }>;
  hintText?: string;
}) {
  const statusText = useMemo(
    () => getStatusMessage(progress, statusMessages),
    [progress, statusMessages]
  );
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="relative flex w-full flex-col items-center justify-center py-10 sm:py-14"
      aria-label="Processing your image"
      aria-busy="true"
    >
      {/* Giant progress number */}
      <div className="relative select-none">
        <motion.p
          key={pct}
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 1 }}
          className="font-display text-[7.5rem] font-bold leading-none tracking-[-0.06em] text-white sm:text-[10rem]"
        >
          {pct}
          <span className="text-[2.5rem] text-brand-secondary sm:text-[3.5rem]">%</span>
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={statusText}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 text-sm font-medium tracking-wide text-white/55 sm:text-base"
        >
          {statusText}
        </motion.p>
      </AnimatePresence>

      <div className="mt-8 h-[2px] w-40 overflow-hidden bg-white/10 sm:w-52">
        <motion.div
          className="h-full bg-brand-secondary"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {previewUrl ? (
        <div className="mt-10 h-20 w-20 overflow-hidden border border-white/10 sm:h-24 sm:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="h-full w-full object-cover opacity-80" />
        </div>
      ) : null}

      <p className="mt-4 text-xs text-white/30">{hintText}</p>
    </motion.div>
  );
}

export function ProcessingErrorCard({
  message,
  onRetry,
  onReset,
}: {
  message: string;
  onRetry: () => void;
  onReset: () => void;
}) {
  return (
    <div className="w-full py-10 text-center" role="alert">
      <p className="font-display text-lg font-bold text-white">{message}</p>
      <p className="mt-2 text-sm text-white/40">Please try again.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "min-h-[44px] bg-brand-secondary px-6 text-sm font-semibold text-brand-navy",
            "transition-opacity hover:opacity-90"
          )}
        >
          Retry
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] border border-white/20 px-6 text-sm font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          Upload different image
        </button>
      </div>
    </div>
  );
}
