"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_MESSAGES = [
  { threshold: 0, text: "Uploading image..." },
  { threshold: 25, text: "Removing background..." },
  { threshold: 70, text: "Almost done..." },
  { threshold: 100, text: "Complete!" },
];

function getStatusMessage(progress: number, steps: Array<{ threshold: number; text: string }>) {
  let message = steps[0]?.text ?? "Processing...";
  for (const step of steps) {
    if (progress >= step.threshold) message = step.text;
  }
  return message;
}

/** Inline processing card — lives inside the upload section, not a separate page section. */
export function ProcessingAnimation({
  progress,
  active,
  statusMessages = STATUS_MESSAGES,
  hintText = "This takes about 2–3 seconds",
}: {
  progress: number;
  active: boolean;
  statusMessages?: Array<{ threshold: number; text: string }>;
  hintText?: string;
}) {
  const statusText = useMemo(() => getStatusMessage(progress, statusMessages), [progress, statusMessages]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-md sm:p-8"
      aria-label="Processing your image"
      aria-busy="true"
    >
      <div className="mb-6 h-[3px] w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-brand-secondary to-brand-purple"
          initial={false}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="mb-6 flex justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-[3px] border-blue-200 border-t-blue-600 sm:h-12 sm:w-12 sm:border-4"
          style={{ animationDuration: "1s" }}
          role="status"
          aria-label="Processing"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={statusText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-base font-medium text-gray-700 sm:text-lg"
        >
          {statusText}
        </motion.p>
      </AnimatePresence>

      <p className="mt-2 text-[13px] text-gray-400">{hintText}</p>
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
    <div
      className="w-full rounded-2xl border border-red-100 bg-white p-6 text-center shadow-md sm:p-8"
      role="alert"
    >
      <p className="text-base font-medium text-red-600">{message}</p>
      <p className="mt-2 text-[13px] text-gray-400">
        Ensure the API is running at{" "}
        <code className="rounded bg-gray-50 px-1.5 py-0.5 text-gray-600">http://localhost:8000</code>
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "min-h-[44px] rounded-xl bg-brand-secondary px-5 py-2 text-sm font-medium text-white",
            "transition-opacity hover:opacity-90"
          )}
        >
          Retry
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Upload different image
        </button>
      </div>
    </div>
  );
}
