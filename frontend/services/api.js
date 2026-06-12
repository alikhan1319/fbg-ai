/**
 * API client for the FBR AI FastAPI backend.
 * Base URL is configured via NEXT_PUBLIC_API_URL in .env.local
 */

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** All AI tools — large images may take several minutes on CPU */
const LONG_REQUEST_MS = 10 * 60 * 1000;

async function trackToolUsage(toolId, toolName) {
  try {
    await fetch(`${API_URL}/api/analytics/tool-usage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool_id: toolId, tool_name: toolName }),
    });
  } catch {
    // non-blocking analytics
  }
}

async function fetchApi(path, options = {}, timeoutMs = LONG_REQUEST_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Processing is taking longer than expected. Please wait a moment and try again."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function parseApiError(response, fallback) {
  let message = fallback;
  try {
    const data = await response.json();
    if (typeof data.detail === "string") message = data.detail;
    else if (Array.isArray(data.detail)) message = data.detail.map((d) => d.msg).join(", ");
  } catch {
    // keep fallback
  }
  return message;
}

/**
 * Resolve a path returned by the backend (e.g. /uploads/abc.png) to a full URL.
 * @param {string} path
 * @returns {string}
 */
export function resolveApiUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Remove the background from an image file using the rembg backend.
 * @param {File} file - Image file (JPG, PNG, or WebP)
 * @returns {Promise<{ job_id: string, original_image_url: string, processed_image_url: string, original_filename: string }>}
 */
export async function removeBackground(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchApi("/remove-bg", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to remove background. Please try again."));
  }

  const data = await response.json();
  trackToolUsage("remove-bg", "Background Remover");
  return {
    ...data,
    original_image_url: resolveApiUrl(data.original_image_url),
    processed_image_url: resolveApiUrl(data.processed_image_url),
  };
}

/**
 * Upscale an image using backend endpoint.
 * @param {File} file
 * @param {2|4} scale
 */
export async function upscaleImage(file, scale = 2) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scale", String(scale));

  const response = await fetchApi("/upscale", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to upscale image. Please try again."));
  }

  const data = await response.json();
  trackToolUsage("upscale", "Image Upscaler");
  return {
    ...data,
    original_image_url: resolveApiUrl(data.original_image_url),
    processed_image_url: resolveApiUrl(data.processed_image_url),
  };
}

/**
 * Blur background while keeping subject clear.
 * @param {File} file
 * @param {number} intensity 0-100
 */
export async function blurBackground(file, intensity = 55) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("intensity", String(intensity));

  const response = await fetchApi("/blur-background", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to blur background. Please try again."));
  }

  const data = await response.json();
  trackToolUsage("blur-bg", "Background Blur");
  return {
    ...data,
    original_image_url: resolveApiUrl(data.original_image_url),
    processed_image_url: resolveApiUrl(data.processed_image_url),
  };
}

/**
 * Enhance image with advanced clarity controls.
 * @param {File} file
 * @param {{sharpen?: number, denoise?: number}} options
 */
export async function enhanceImage(file, options = {}) {
  const { sharpen = 40, denoise = 25 } = options;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sharpen", String(sharpen));
  formData.append("denoise", String(denoise));

  const response = await fetchApi("/enhance-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to enhance image. Please try again."));
  }

  const data = await response.json();
  trackToolUsage("enhance", "Image Enhancer");
  return {
    ...data,
    original_image_url: resolveApiUrl(data.original_image_url),
    processed_image_url: resolveApiUrl(data.processed_image_url),
  };
}

/**
 * Generate a new background from prompt or solid color.
 * @param {File} file
 * @param {{prompt?: string, solidColor?: string}} options
 */
export async function generateBackground(file, options = {}) {
  const { prompt = "", solidColor = "" } = options;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", prompt);
  formData.append("solid_color", solidColor);

  const response = await fetchApi("/generate-background", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to generate background. Please try again."));
  }

  const data = await response.json();
  trackToolUsage("gen-bg", "Generate Background");
  return {
    ...data,
    original_image_url: resolveApiUrl(data.original_image_url),
    processed_image_url: resolveApiUrl(data.processed_image_url),
  };
}

/**
 * Remove watermark from user-marked region only (mask PNG: white = remove, black = keep).
 * @param {File} file
 * @param {Blob} maskBlob
 */
export async function removeWatermark(file, maskBlob) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mask", maskBlob, "mask.png");

  const response = await fetchApi("/remove-watermark", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to remove watermark. Please try again."));
  }

  const data = await response.json();
  trackToolUsage("watermark", "Watermark Remover");
  return {
    ...data,
    original_image_url: resolveApiUrl(data.original_image_url),
    processed_image_url: resolveApiUrl(data.processed_image_url),
  };
}

export { API_URL };
