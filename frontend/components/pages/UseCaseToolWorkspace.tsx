"use client";

import { RemoveBgUpload } from "@/components/tool/RemoveBgUpload";
import { UpscaleUpload } from "@/components/tool/UpscaleUpload";
import { EnhanceImageUpload } from "@/components/tool/EnhanceImageUpload";
import { BlurBackgroundUpload } from "@/components/tool/BlurBackgroundUpload";
import { GenerateBackgroundUpload } from "@/components/tool/GenerateBackgroundUpload";
import { RemoveWatermarkUpload } from "@/components/tool/RemoveWatermarkUpload";
import type { ToolPageConfig } from "@/components/tool/ToolLayout";
import type { LandingToolId, UseCaseLanding } from "@/lib/use-case-landings";

type UploadConfig = Pick<
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

const TOOL_COPY: Record<
  LandingToolId,
  {
    uploadLabel: string;
    processingLabel: string;
    successLabel: string;
    downloadLabel: string;
    features: ToolPageConfig["features"];
  }
> = {
  "remove-bg": {
    uploadLabel: "Upload image to remove background",
    processingLabel: "AI is removing your background…",
    successLabel: "Background removed successfully!",
    downloadLabel: "Download PNG",
    features: [
      { title: "Subject detection", description: "AI finds the object first, then clears the background." },
      { title: "Smooth edges", description: "Clean corners and hair-level detail on cutouts." },
      { title: "Transparent PNG", description: "Download ready-to-use files with no watermark." },
      { title: "Free & private", description: "No signup. Uploads auto-delete after processing." },
    ],
  },
  upscale: {
    uploadLabel: "Upload image to upscale",
    processingLabel: "AI is upscaling your image…",
    successLabel: "Image upscaled successfully!",
    downloadLabel: "Download upscaled image",
    features: [
      { title: "2× or 4× upscale", description: "Enlarge photos without soft mushy detail." },
      { title: "Detail recovery", description: "Sharpens edges for print and marketplace use." },
      { title: "Fast results", description: "Upload once and download a larger file." },
      { title: "Free to try", description: "No signup required for standard images." },
    ],
  },
  enhance: {
    uploadLabel: "Upload image to enhance",
    processingLabel: "AI is enhancing your image…",
    successLabel: "Image enhanced successfully!",
    downloadLabel: "Download enhanced image",
    features: [
      { title: "Clarity boost", description: "Improve sharpness and overall definition." },
      { title: "Noise cleanup", description: "Reduce grain while keeping natural texture." },
      { title: "Color polish", description: "Balanced look for listings and social posts." },
      { title: "One-click flow", description: "Upload, enhance, and download in seconds." },
    ],
  },
  "blur-bg": {
    uploadLabel: "Upload image to blur background",
    processingLabel: "AI is blurring the background…",
    successLabel: "Background blurred successfully!",
    downloadLabel: "Download image",
    features: [
      { title: "Subject stays sharp", description: "Only the background softens." },
      { title: "Portrait look", description: "Quick depth-of-field style for people and products." },
      { title: "Adjustable feel", description: "Natural soft blur for photos and thumbnails." },
      { title: "Free online", description: "No install, no signup." },
    ],
  },
  "gen-bg": {
    uploadLabel: "Upload image to generate background",
    processingLabel: "AI is generating a new background…",
    successLabel: "Background generated successfully!",
    downloadLabel: "Download image",
    features: [
      { title: "New scene", description: "Replace the old backdrop with a fresh look." },
      { title: "Subject preserved", description: "Your object stays intact in the foreground." },
      { title: "Studio styles", description: "Great for products, portraits, and creatives." },
      { title: "Fast export", description: "Download when the new scene is ready." },
    ],
  },
  watermark: {
    uploadLabel: "Upload image to remove watermark",
    processingLabel: "AI is removing the watermark…",
    successLabel: "Watermark removed successfully!",
    downloadLabel: "Download clean image",
    features: [
      { title: "Clean fill", description: "Rebuild covered pixels for a natural result." },
      { title: "Logo cleanup", description: "Helpful for stamps, marks, and overlays." },
      { title: "Keep detail", description: "Protect surrounding texture where possible." },
      { title: "Free workflow", description: "Upload and download without an account." },
    ],
  },
};

function buildConfig(landing: UseCaseLanding): UploadConfig {
  const copy = TOOL_COPY[landing.toolId];
  return {
    uploadLabel: copy.uploadLabel,
    processingLabel: copy.processingLabel,
    successLabel: copy.successLabel,
    downloadLabel: copy.downloadLabel,
    heroGradientClass: "btn-gradient",
    features: copy.features,
    ctaLabel: landing.ctaLabel,
    layoutOptions: {
      hideAdsSidebar: true,
      enhancedUpload: true,
      useLiveApi: true,
    },
  };
}

export function UseCaseToolWorkspace({ landing }: { landing: UseCaseLanding }) {
  const config = buildConfig(landing);

  switch (landing.toolId) {
    case "remove-bg":
      return <RemoveBgUpload config={config} />;
    case "upscale":
      return <UpscaleUpload config={config} />;
    case "enhance":
      return <EnhanceImageUpload config={config} />;
    case "blur-bg":
      return <BlurBackgroundUpload config={config} />;
    case "gen-bg":
      return <GenerateBackgroundUpload config={config} />;
    case "watermark":
      return <RemoveWatermarkUpload config={config} />;
    default:
      return null;
  }
}
