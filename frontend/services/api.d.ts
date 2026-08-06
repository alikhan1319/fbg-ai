export const API_URL: string;

export function resolveApiUrl(path: string): string;

export type ToolImageResult = {
  job_id: string;
  original_image_url: string;
  processed_image_url: string;
  original_filename?: string;
  background_image_url?: string;
  image_type?: string;
  [key: string]: unknown;
};

export function removeBackground(file: File): Promise<ToolImageResult>;
export function upscaleImage(file: File, scale?: 2 | 4): Promise<ToolImageResult>;
export function blurBackground(file: File, intensity?: number): Promise<ToolImageResult>;
export function enhanceImage(
  file: File,
  options?: { sharpen?: number; denoise?: number }
): Promise<ToolImageResult>;
export function generateBackground(
  file: File,
  options?: { prompt?: string; solidColor?: string }
): Promise<ToolImageResult>;
export function removeWatermark(file: File, maskBlob: Blob): Promise<ToolImageResult>;
