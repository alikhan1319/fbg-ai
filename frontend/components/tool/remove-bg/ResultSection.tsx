"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Copy, Download, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SectionShell } from "@/components/ui/SectionHeading";
import { CompareSlider } from "@/components/ui/CompareSlider";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ResultImageCard({
  label,
  src,
  alt,
  sizeLabel,
  checkerboard,
  children,
}: {
  label: string;
  src: string;
  alt: string;
  sizeLabel: string;
  checkerboard?: boolean;
  children?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        <span className="text-xs text-gray-400">{sizeLabel}</span>
      </div>
      <div
        className={cn(
          "relative mt-4 flex-1 overflow-hidden rounded-xl border border-gray-100 bg-gray-50",
          checkerboard && "checkerboard"
        )}
      >
        {!loaded && <div className="skeleton-shimmer absolute inset-0 aspect-4/5" />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={cn(
            "aspect-4/5 w-full object-contain transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}

export function ResultSection({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  fileName,
  heroGradientClass,
  downloadLabel,
  successLabel,
  onReset,
  onDownload,
  onCopyLink,
  onTweet,
  resultAriaLabel = "Background removal results",
  originalAlt = "Original uploaded image before background removal",
  processedAlt = "Processed image with transparent background",
  processedLabel = "Processed Image",
  checkerboardProcessed = true,
  useCompareSlider = false,
}: {
  originalUrl: string;
  processedUrl: string;
  originalSize: number;
  processedSize: number | null;
  fileName: string;
  heroGradientClass: string;
  downloadLabel: string;
  successLabel: string;
  onReset: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onTweet: () => void;
  resultAriaLabel?: string;
  originalAlt?: string;
  processedAlt?: string;
  processedLabel?: string;
  checkerboardProcessed?: boolean;
  useCompareSlider?: boolean;
}) {
  const confettiFired = useRef(false);

  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ["#1D4ED8", "#8B5CF6"],
    });
  }, []);

  const processedSizeLabel = processedSize != null ? formatBytes(processedSize) : "PNG";

  return (
    <SectionShell id="results" className="bg-gray-50/50" ariaLabel={resultAriaLabel}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-10 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden />
          <h2 className="mt-4 text-xl font-medium text-gray-800 sm:text-2xl">Compare your before & after</h2>
          <p className="mt-2 text-sm text-gray-500">{successLabel}</p>
        </div>

        {useCompareSlider ? (
          <div className="mx-auto max-w-2xl">
            <div className="luxury-card image-zoom overflow-hidden rounded-2xl border-0 p-0">
              <CompareSlider
                before={originalUrl}
                after={processedUrl}
                altBefore={originalAlt}
                altAfter={processedAlt}
                className="aspect-[4/3] rounded-2xl shadow-none"
                transparentAfter={checkerboardProcessed}
                useNativeImage
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5">
                Original: {formatBytes(originalSize)}
              </span>
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5">
                {processedLabel}: {processedSizeLabel}
              </span>
            </div>

            <div className="mt-5">
              <Button className={cn("min-h-[44px] w-full", heroGradientClass)} onClick={onDownload}>
                <Download className="h-4 w-4" />
                {downloadLabel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <ResultImageCard
              label="Original Image"
              src={originalUrl}
              alt={originalAlt}
              sizeLabel={formatBytes(originalSize)}
            />
            <ResultImageCard
              label={processedLabel}
              src={processedUrl}
              alt={processedAlt}
              sizeLabel={processedSizeLabel}
              checkerboard={checkerboardProcessed}
            >
              <Button className={cn("min-h-[44px] w-full", heroGradientClass)} onClick={onDownload}>
                <Download className="h-4 w-4" />
                {downloadLabel}
              </Button>
            </ResultImageCard>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-center text-xs text-gray-400">
            {fileName} · auto-deleted in 1 hour
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="min-h-[44px]" onClick={onReset}>
              <RefreshCw className="h-4 w-4" />
              Try Another Image
            </Button>
            <Button variant="secondary" className="min-h-[44px]" onClick={onCopyLink}>
              <Copy className="h-4 w-4" />
              Copy Result Link
            </Button>
            <Button variant="outline" className="min-h-[44px]" onClick={onTweet}>
              <ExternalLink className="h-4 w-4" />
              Tweet Result
            </Button>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
