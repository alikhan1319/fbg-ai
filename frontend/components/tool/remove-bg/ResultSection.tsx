"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, Copy, Download, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SectionShell } from "@/components/ui/SectionHeading";
import { CompareSlider } from "@/components/ui/CompareSlider";
import { SOCIAL_LINKS } from "@/lib/constants";

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
    <article className="flex h-full flex-col border border-brand-border bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-muted">{label}</h3>
        <span className="text-xs tabular-nums text-brand-muted">{sizeLabel}</span>
      </div>
      <div
        className={cn(
          "relative mt-4 flex-1 overflow-hidden border border-brand-border bg-brand-bg",
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
  resultAriaLabel = "Background removal results",
  originalAlt = "Original uploaded image before background removal",
  processedAlt = "Processed image with transparent background",
  processedLabel = "Processed Image",
  checkerboardProcessed = true,
  useCompareSlider = false,
  imageType,
  backgroundUrl,
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
  /** @deprecated Tweet share removed — Instagram & Facebook only */
  onTweet?: () => void;
  resultAriaLabel?: string;
  originalAlt?: string;
  processedAlt?: string;
  processedLabel?: string;
  checkerboardProcessed?: boolean;
  useCompareSlider?: boolean;
  imageType?: string | null;
  backgroundUrl?: string | null;
}) {
  const confettiFired = useRef(false);

  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ["#00BFA6", "#0E1114", "#F6F7F8"],
    });
  }, []);

  const sharePageUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const shareFacebook = () => {
    const page = encodeURIComponent(sharePageUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${page}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareInstagram = () => {
    const instagram = SOCIAL_LINKS.find((s) => s.label === "Instagram");
    window.open(instagram?.href || "https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  const processedSizeLabel = processedSize != null ? formatBytes(processedSize) : "PNG";

  return (
    <SectionShell id="results" className="bg-brand-bg" ariaLabel={resultAriaLabel}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-10 max-w-xl">
          <p className="studio-label inline-flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-secondary" aria-hidden />
            Ready to export
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            Before & <span className="text-brand-secondary">after.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">{successLabel}</p>
          {imageType ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
              Detected · {imageType}
            </p>
          ) : null}
        </div>

        {useCompareSlider ? (
          <div>
            <div className="overflow-hidden border border-brand-border bg-white">
              <CompareSlider
                before={originalUrl}
                after={processedUrl}
                altBefore={originalAlt}
                altAfter={processedAlt}
                className="aspect-[4/3] rounded-none shadow-none"
                transparentAfter={checkerboardProcessed}
                useNativeImage
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
              <span className="border border-brand-border bg-white px-3 py-1.5">
                Original: {formatBytes(originalSize)}
              </span>
              <span className="border border-brand-border bg-white px-3 py-1.5">
                {processedLabel}: {processedSizeLabel}
              </span>
            </div>

            <div className="mt-5">
              <Button className={cn("btn-gradient min-h-[48px] w-full sm:w-auto", heroGradientClass)} onClick={onDownload}>
                <Download className="h-4 w-4" />
                {downloadLabel}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <ResultImageCard
              label="Background sheet"
              src={backgroundUrl || originalUrl}
              alt="Detected background plate"
              sizeLabel={backgroundUrl ? "BG" : formatBytes(originalSize)}
            />
            <ResultImageCard
              label="Object sheet"
              src={processedUrl}
              alt={processedAlt}
              sizeLabel={processedSizeLabel}
              checkerboard={checkerboardProcessed}
            >
              <Button className={cn("btn-gradient min-h-[44px] w-full", heroGradientClass)} onClick={onDownload}>
                <Download className="h-4 w-4" />
                {downloadLabel}
              </Button>
            </ResultImageCard>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-brand-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-brand-muted">
            {fileName} · auto-deleted in 1 hour
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="min-h-[44px]" onClick={onReset}>
              <RefreshCw className="h-4 w-4" />
              Try Another Image
            </Button>
            <Button variant="secondary" className="min-h-[44px]" onClick={onCopyLink}>
              <Copy className="h-4 w-4" />
              Copy Result Link
            </Button>
            <Button variant="outline" className="min-h-[44px]" onClick={shareInstagram}>
              <ExternalLink className="h-4 w-4" />
              Instagram
            </Button>
            <Button variant="outline" className="min-h-[44px]" onClick={shareFacebook}>
              <ExternalLink className="h-4 w-4" />
              Facebook
            </Button>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
