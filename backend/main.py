"""
FBR AI — Professional background removal API (single-file backend)

Features:
  - Advanced rembg model (birefnet-general → isnet-general-use fallback)
  - Alpha matting for hair, fur, text edges, and fine details
  - Foreground preserved: text, logos, graphics stay intact
  - Transparent PNG output
  - Auto cleanup of uploads after 1 hour

Run (from backend folder):
  python main.py              # auto-uses .venv311 if it exists
  python main.py --setup      # create .venv311 + install deps (first time)
"""

from __future__ import annotations

import bootstrap

bootstrap.ensure_venv_python()

import asyncio
import os
import sys
import hashlib
import io
import logging
import time
import uuid
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from env_loader import env_list, load_env

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cv2
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
from rembg import new_session, remove
try:
    from advanced_upscale import upscale_image_bytes as advanced_upscale_image_bytes
    ADVANCED_UPSCALE_AVAILABLE = True
except Exception:
    advanced_upscale_image_bytes = None
    ADVANCED_UPSCALE_AVAILABLE = False
try:
    from professional_enhance import professional_enhance_bytes
    PROFESSIONAL_ENHANCE_AVAILABLE = True
except Exception:
    professional_enhance_bytes = None
    PROFESSIONAL_ENHANCE_AVAILABLE = False
try:
    from lama_watermark import remove_watermark_bytes as lama_remove_watermark_bytes
    LAMA_WATERMARK_AVAILABLE = True
except Exception:
    lama_remove_watermark_bytes = None
    LAMA_WATERMARK_AVAILABLE = False

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("fbr-ai")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

load_env()

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_BYTES = 15 * 1024 * 1024
MAX_EDGE_PX = 1536  # tighter cap for consistent 2–3s CPU response on common photos
MAX_WHITE_BFS_PIXELS = 2_000_000  # skip slow Python flood-fill on very large images
API_BUILD = "2026-05-30-testimonials-v1"  # bump when deploy/restart required
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
FILE_TTL_SECONDS = 3600
MAX_UPSCALE_OUTPUT_EDGE = 4096
MAX_UPSCALE_ENHANCE_EDGE = 1536  # larger working size = visibly better upscale detail
MAX_ENHANCE_EDGE = 2800
ALLOW_LEGACY_UPSCALE_FALLBACK = True  # fast OpenCV fallback if AI upscale fails or is too slow
REALESRGAN_SOFT_TIMEOUT_SEC = 300  # per-request AI limit, then seamless fast fallback
ENHANCE_AI_TIMEOUT_SEC = 180  # Real-ESRGAN enhance path, then CV fallback
MAX_WM_INPAINT_EDGE = 960  # legacy — kept for reference
MAX_WM_FULL_RES_EDGE = 1536  # full-res inpaint below this crop size (sharp)

# Comma-separated frontend URLs — set CORS_ORIGINS in backend/.env
CORS_ORIGINS = env_list(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
)

# Model preference for production speed + quality.
# We intentionally load only ONE model at startup to avoid long boot times.
REMBG_MODEL_CANDIDATES = (
    "u2netp",  # lightweight and fast for general photos/products
    "birefnet-general",  # higher quality fallback for hard edges/details
)

# Alpha matting = cleaner edges around hair, fur, and semi-transparent areas
ALPHA_MATTING = True
ALPHA_FG_THRESHOLD = 240
ALPHA_BG_THRESHOLD = 15
ALPHA_ERODE = 8

# ---------------------------------------------------------------------------
# Global state (loaded once at startup)
# ---------------------------------------------------------------------------
rembg_sessions: dict[str, Any] = {}
active_model_name: str = "unknown"
advanced_upscale_ready: bool = False
advanced_upscale_error: str | None = None
executor = ThreadPoolExecutor(max_workers=2)
upscale_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="upscale")


def _load_rembg_sessions() -> None:
    """Load only the first available model to keep startup fast and stable."""
    global rembg_sessions, active_model_name
    rembg_sessions = {}

    for model_name in REMBG_MODEL_CANDIDATES:
        try:
            logger.info("Loading rembg model: %s …", model_name)
            rembg_sessions[model_name] = new_session(model_name)
            logger.info("rembg model ready: %s", model_name)
            # Stop after first successful model to prevent large startup downloads.
            active_model_name = model_name
            logger.info("Using model: %s", active_model_name)
            return
        except Exception as exc:
            logger.warning("Could not load model %s: %s", model_name, exc)

    if not rembg_sessions:
        raise RuntimeError("No rembg model could be loaded. Run: pip install rembg[cpu]")


def cleanup_expired_files() -> int:
    """Delete files older than FILE_TTL_SECONDS. Returns count removed."""
    now = time.time()
    removed = 0
    for path in UPLOAD_DIR.iterdir():
        if not path.is_file():
            continue
        if now - path.stat().st_mtime > FILE_TTL_SECONDS:
            path.unlink(missing_ok=True)
            removed += 1
    if removed:
        logger.info("Cleaned up %d expired upload(s)", removed)
    return removed


def _prepare_input_bytes(raw: bytes) -> tuple[bytes, tuple[int, int] | None]:
    """
    Optionally downscale very large images for 1–3s CPU processing.
    Returns (bytes_to_process, original_size_or_none_if_resized).
    """
    img = Image.open(io.BytesIO(raw))
    original_size = img.size
    w, h = img.size

    if max(w, h) <= MAX_EDGE_PX:
        return raw, None

    scale = MAX_EDGE_PX / max(w, h)
    new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
    resized = img.convert("RGBA").resize(new_size, Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    resized.save(buf, format="PNG")
    logger.info("Downscaled %dx%d → %dx%d for processing", w, h, *new_size)
    return buf.getvalue(), original_size


def _foreground_ratio(alpha: np.ndarray) -> float:
    return float(np.count_nonzero(alpha > 10)) / float(alpha.size)


def _extract_alpha(image_bytes: bytes) -> np.ndarray:
    arr = np.array(Image.open(io.BytesIO(image_bytes)).convert("RGBA"))
    return arr[:, :, 3]


def _compose_png_with_alpha(raw: bytes, alpha: np.ndarray) -> bytes:
    src = Image.open(io.BytesIO(raw)).convert("RGBA")
    arr = np.array(src)
    arr[:, :, 3] = alpha
    out = Image.fromarray(arr, mode="RGBA")
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def _is_white_like(pixel: np.ndarray, threshold: int = 242, max_chroma: int = 20) -> bool:
    r, g, b = int(pixel[0]), int(pixel[1]), int(pixel[2])
    return r >= threshold and g >= threshold and b >= threshold and (max(r, g, b) - min(r, g, b) <= max_chroma)


def _remove_white_background_connected(raw: bytes) -> bytes | None:
    """
    Remove only white-ish background connected to image borders.
    This preserves internal logo/text/graphics details and is ideal
    for brand marks on white backgrounds.
    Returns PNG bytes or None when this strategy is not applicable.
    """
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    rgb = np.array(img)
    h, w, _ = rgb.shape
    total = h * w
    if total > MAX_WHITE_BFS_PIXELS:
        # Avoid long per-pixel BFS on large photos.
        return None

    border = np.concatenate([rgb[0, :, :], rgb[-1, :, :], rgb[:, 0, :], rgb[:, -1, :]], axis=0)
    border_white = np.mean(
        np.array([_is_white_like(px, threshold=240, max_chroma=22) for px in border], dtype=np.float32)
    )
    if border_white < 0.62:
        return None

    white_mask = np.zeros((h, w), dtype=bool)
    # Vectorized white-like check
    min_c = rgb.min(axis=2)
    max_c = rgb.max(axis=2)
    white_mask = (rgb[:, :, 0] >= 240) & (rgb[:, :, 1] >= 240) & (rgb[:, :, 2] >= 240) & ((max_c - min_c) <= 22)

    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        q.append((0, x))
        q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0))
        q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        if y < 0 or y >= h or x < 0 or x >= w:
            continue
        if visited[y, x] or not white_mask[y, x]:
            continue
        visited[y, x] = True
        q.append((y - 1, x))
        q.append((y + 1, x))
        q.append((y, x - 1))
        q.append((y, x + 1))

    bg_mask = visited
    fg_ratio = 1.0 - (float(np.count_nonzero(bg_mask)) / float(total))
    # Reject if this heuristic would over-remove or under-remove
    if fg_ratio < 0.01 or fg_ratio > 0.92:
        return None

    alpha = np.full((h, w), 255, dtype=np.uint8)
    alpha[bg_mask] = 0
    return _compose_png_with_alpha(raw, alpha)


def _run_rembg_candidate(raw: bytes, model_name: str, session: Any) -> tuple[bytes, float]:
    use_alpha = model_name != "u2netp"
    output_bytes = remove(
        raw,
        session=session,
        alpha_matting=ALPHA_MATTING if use_alpha else False,
        alpha_matting_foreground_threshold=ALPHA_FG_THRESHOLD,
        alpha_matting_background_threshold=ALPHA_BG_THRESHOLD,
        alpha_matting_erode_size=ALPHA_ERODE,
        post_process_mask=True,
    )
    score = _foreground_ratio(_extract_alpha(output_bytes))
    return output_bytes, score


def _select_model_order(raw: bytes) -> list[str]:
    """
    Heuristic model order:
    - logo/text/graphic-like images (many very dark+very bright pixels) do better with u2net first
    - general photos do better with birefnet-general first
    """
    arr = np.array(Image.open(io.BytesIO(raw)).convert("RGB"))
    gray = arr.mean(axis=2)
    dark_ratio = float(np.mean(gray < 40))
    bright_ratio = float(np.mean(gray > 220))
    graphic_like = dark_ratio > 0.03 and bright_ratio > 0.18

    # For graphic-heavy images we prefer detail retention model first.
    preferred = ["birefnet-general", "u2netp"] if graphic_like else ["u2netp", "birefnet-general"]
    return [m for m in preferred if m in rembg_sessions]


def _remove_background_pro(raw: bytes) -> tuple[bytes, str]:
    """
    Professional background removal:
    - Keeps all foreground pixels (people, products, text, logos)
    - Removes only background
    - Returns PNG bytes with alpha channel
    """
    if not rembg_sessions:
        raise RuntimeError("Background removal model is not loaded.")

    input_bytes, original_size = _prepare_input_bytes(raw)

    # Strategy A: white border connected-background removal (best for logos/text on white)
    white_bg_result = _remove_white_background_connected(input_bytes)
    if white_bg_result is not None:
        output_image = Image.open(io.BytesIO(white_bg_result)).convert("RGBA")
        if original_size and output_image.size != original_size:
            output_image = output_image.resize(original_size, Image.Resampling.LANCZOS)
        out_buf = io.BytesIO()
        output_image.save(out_buf, format="PNG", optimize=True)
        return out_buf.getvalue(), "white-bg-preserve"

    # Strategy B: rembg model fallback chain with quality scoring
    model_order = _select_model_order(input_bytes)
    started = time.perf_counter()
    best_bytes: bytes | None = None
    best_model = active_model_name
    best_score = -1.0
    for idx, model_name in enumerate(model_order):
        session = rembg_sessions[model_name]
        try:
            candidate, score = _run_rembg_candidate(input_bytes, model_name, session)
            # Prefer candidates with plausible foreground coverage
            quality = score if 0.02 <= score <= 0.98 else score * 0.5
            if quality > best_score:
                best_score = quality
                best_bytes = candidate
                best_model = model_name
            # Keep latency bounded for frontend UX.
            if (time.perf_counter() - started) > 10.0 and best_bytes is not None:
                break
            # Fast path: if first preferred model gives a healthy mask, stop.
            if idx == 0 and 0.03 <= score <= 0.92:
                break
            # Any strong candidate can end search early.
            if quality >= 0.75:
                break
        except Exception as exc:
            logger.warning("Model %s failed for request: %s", model_name, exc)

    if best_bytes is None:
        raise RuntimeError("All background removal candidates failed.")

    output_bytes = best_bytes

    output_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")

    # Restore original dimensions if we downscaled
    if original_size and output_image.size != original_size:
        output_image = output_image.resize(original_size, Image.Resampling.LANCZOS)

    out_buf = io.BytesIO()
    output_image.save(out_buf, format="PNG", optimize=True)
    return out_buf.getvalue(), best_model


def _save_original(raw: bytes, content_type: str, path: Path) -> None:
    img = Image.open(io.BytesIO(raw))
    if content_type == "image/jpeg":
        img.convert("RGB").save(path, format="JPEG", quality=92)
    elif content_type == "image/png":
        img.save(path, format="PNG")
    else:
        img.save(path, format="WEBP", quality=92)


def _blur_background_pro(raw: bytes, intensity: int) -> tuple[bytes, str]:
    """
    Keep subject clear and blur only background using the same subject mask
    pipeline as remove-bg for consistent quality.
    """
    intensity = int(np.clip(intensity, 0, 100))
    original_bgr = _decode_upload_bgr(raw)
    h, w = original_bgr.shape[:2]

    rgba_bytes, used_model = _remove_background_pro(raw)
    rgba = Image.open(io.BytesIO(rgba_bytes)).convert("RGBA")
    rgba_np = np.asarray(rgba, dtype=np.uint8)
    if rgba_np.shape[0] != h or rgba_np.shape[1] != w:
        rgba_np = cv2.resize(rgba_np, (w, h), interpolation=cv2.INTER_LINEAR)

    alpha = rgba_np[:, :, 3].astype(np.float32) / 255.0

    # Smooth alpha edge keeps natural transition between subject and blurred bg.
    edge_sigma = 0.7 + (intensity / 100.0) * 1.2
    alpha_soft = cv2.GaussianBlur(alpha, (0, 0), sigmaX=edge_sigma, sigmaY=edge_sigma)
    alpha_soft = np.clip(alpha_soft, 0.0, 1.0)

    # Blur strength scales with slider intensity and image resolution.
    max_side = max(h, w)
    base_sigma = (intensity / 100.0) * (2.2 + max_side / 1100.0)
    if base_sigma <= 0.01:
        blurred_bg = original_bgr.copy()
    else:
        blurred_bg = cv2.GaussianBlur(original_bgr, (0, 0), sigmaX=base_sigma, sigmaY=base_sigma)
        # Secondary pass for stronger bokeh feel at high intensity.
        if intensity >= 65:
            blurred_bg = cv2.GaussianBlur(blurred_bg, (0, 0), sigmaX=base_sigma * 0.6, sigmaY=base_sigma * 0.6)

    comp = (
        original_bgr.astype(np.float32) * alpha_soft[..., None]
        + blurred_bg.astype(np.float32) * (1.0 - alpha_soft[..., None])
    )
    comp = np.clip(comp, 0, 255).astype(np.uint8)

    out = io.BytesIO()
    Image.fromarray(cv2.cvtColor(comp, cv2.COLOR_BGR2RGB), mode="RGB").save(
        out, format="JPEG", quality=94, optimize=True, progressive=True
    )
    return out.getvalue(), used_model


def _enhancement_mode_label(blur_score: float) -> str:
    if blur_score < 60:
        return "strong-recovery"
    if blur_score < 140:
        return "balanced-clarity"
    return "advanced-enhance"


def _apply_user_enhance_controls_cv(
    bgr: np.ndarray,
    *,
    sharpen: int,
    denoise: int,
    blur_score: float,
    clarity_denoised: bool,
) -> np.ndarray:
    sharpen = int(np.clip(sharpen, 0, 100))
    denoise = int(np.clip(denoise, 0, 100))
    is_high_key = _is_high_key_image(bgr)
    h, w = bgr.shape[:2]
    out = bgr

    sharpen_scale = 0.30 if blur_score >= 160 else (0.50 if blur_score >= 100 else 0.75)
    denoise_scale = 0.20 if clarity_denoised else (0.40 if blur_score >= 140 else 0.65)
    effective_sharpen = sharpen * sharpen_scale
    effective_denoise = denoise * denoise_scale

    if effective_denoise > 0 and not is_high_key and h * w < 1_200_000:
        denoise_h = 3 + int(round(effective_denoise / 30))
        out = cv2.fastNlMeansDenoisingColored(
            out,
            None,
            h=max(3, denoise_h),
            hColor=max(3, denoise_h),
            templateWindowSize=7,
            searchWindowSize=21,
        )
    elif effective_denoise > 0:
        out = cv2.bilateralFilter(out, 3, 24, 24)

    if effective_sharpen > 0:
        amount = 0.08 + (effective_sharpen / 100.0) * (0.40 if is_high_key else 0.62)
        sigma = 0.85 if effective_sharpen >= 55 else 1.0
        out = _unsharp_mask(out, amount=amount, sigma=sigma)

    micro = (0.12 + (effective_sharpen / 100.0) * 0.16) if is_high_key else (0.20 + (effective_sharpen / 100.0) * 0.22)
    out = _boost_microcontrast(out, micro)
    return out


def _gentle_enhance_cv(bgr: np.ndarray, sharpen: int, denoise: int, blur_score: float) -> np.ndarray:
    """Light polish only — avoids destroying bright, sharp photos."""
    high_key = _is_high_key_image(bgr)
    out = bgr.copy()
    sharpen_scale = 0.12 if (high_key and blur_score >= 100) else (0.22 if blur_score >= 130 else 0.38)
    denoise_scale = 0.0 if high_key else (0.12 if blur_score >= 130 else 0.28)
    effective_sharpen = sharpen * sharpen_scale
    effective_denoise = denoise * denoise_scale

    if effective_denoise > 12 and not high_key:
        out = cv2.bilateralFilter(out, 3, 18, 18)
    if effective_sharpen > 0:
        amount = 0.04 + (effective_sharpen / 100.0) * (0.10 if high_key else 0.16)
        out = _unsharp_mask(out, amount=amount, sigma=0.75)
    return _match_luma(bgr, out)


def _enhance_blur_score(bgr: np.ndarray) -> float:
    if ADVANCED_UPSCALE_AVAILABLE:
        try:
            from advanced_upscale import _measure_enhance_blur_score

            return _measure_enhance_blur_score(bgr)
        except Exception:
            pass
    return _measure_blur_score(bgr)


def _enhance_image_cv(raw: bytes, sharpen: int, denoise: int) -> tuple[bytes, float, str]:
    """Classical OpenCV fallback when Real-ESRGAN is unavailable or times out."""
    bgr = _decode_upload_bgr(raw)
    h, w = bgr.shape[:2]
    base = _resize_max_edge(bgr, MAX_ENHANCE_EDGE)
    blur_score = _enhance_blur_score(base)
    high_key = _is_high_key_image(base)
    has_face = False
    try:
        gray = cv2.cvtColor(base, cv2.COLOR_BGR2GRAY)
        cascade = cv2.CascadeClassifier(str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"))
        has_face = len(cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))) > 0
    except Exception:
        pass

    if (high_key and blur_score >= 80) or blur_score >= 160 or (has_face and blur_score >= 45):
        enhanced = _gentle_enhance_cv(base, sharpen, denoise, blur_score)
        if (enhanced.shape[0], enhanced.shape[1]) != (h, w):
            enhanced = cv2.resize(enhanced, (w, h), interpolation=cv2.INTER_LANCZOS4)
        out = io.BytesIO()
        Image.fromarray(cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB), mode="RGB").save(
            out, format="JPEG", quality=96, optimize=True, progressive=True
        )
        return out.getvalue(), blur_score, "gentle-preserve"

    clarity_denoised = blur_score < 80 and not high_key

    enhanced = _enhance_clarity(base, blur_score)
    enhanced = _apply_user_enhance_controls_cv(
        enhanced,
        sharpen=sharpen,
        denoise=denoise,
        blur_score=blur_score,
        clarity_denoised=clarity_denoised,
    )

    if (enhanced.shape[0], enhanced.shape[1]) != (h, w):
        enhanced = cv2.resize(enhanced, (w, h), interpolation=cv2.INTER_LANCZOS4)
    enhanced = _match_luma(bgr, enhanced)

    out = io.BytesIO()
    Image.fromarray(cv2.cvtColor(enhanced, cv2.COLOR_BGR2RGB), mode="RGB").save(
        out, format="JPEG", quality=95, optimize=True, progressive=True
    )
    return out.getvalue(), blur_score, f"opencv-{_enhancement_mode_label(blur_score)}"


def _enhance_image_pro(raw: bytes, sharpen: int, denoise: int) -> tuple[bytes, float, str]:
    """
    Professional tiered enhancement: studio polish, AI recover, or rescue.
    """
    sharpen = int(np.clip(sharpen, 0, 100))
    denoise = int(np.clip(denoise, 0, 100))

    if PROFESSIONAL_ENHANCE_AVAILABLE and professional_enhance_bytes is not None:
        try:
            return professional_enhance_bytes(
                raw,
                sharpen=sharpen,
                denoise=denoise,
                output_format="jpg",
            )
        except Exception as exc:
            logger.warning("Professional enhance failed (%s) — using OpenCV fallback", exc)

    return _enhance_image_cv(raw, sharpen, denoise)


def _measure_blur_score(bgr: np.ndarray) -> float:
    """Higher score = sharper image. Typical blurry photos score below ~80."""
    sample = bgr
    h, w = sample.shape[:2]
    if max(h, w) > 640:
        scale = 640 / max(h, w)
        sample = cv2.resize(
            sample,
            (max(1, int(w * scale)), max(1, int(h * scale))),
            interpolation=cv2.INTER_AREA,
        )
    gray = cv2.cvtColor(sample, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def _resize_max_edge(bgr: np.ndarray, max_edge: int) -> np.ndarray:
    h, w = bgr.shape[:2]
    if max(h, w) <= max_edge:
        return bgr
    scale = max_edge / max(h, w)
    return cv2.resize(
        bgr,
        (max(1, int(w * scale)), max(1, int(h * scale))),
        interpolation=cv2.INTER_AREA,
    )


def _unsharp_mask(bgr: np.ndarray, amount: float, sigma: float) -> np.ndarray:
    blurred = cv2.GaussianBlur(bgr, (0, 0), sigma)
    out = cv2.addWeighted(bgr, 1.0 + amount, blurred, -amount, 0)
    return np.clip(out, 0, 255).astype(np.uint8)


def _mean_luma_bgr(bgr: np.ndarray) -> float:
    yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)
    return float(np.mean(yuv[:, :, 0]))


def _is_high_key_image(bgr: np.ndarray) -> bool:
    """Detect bright photos (white clothes, festivals, product shots on light bg)."""
    y = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)[:, :, 0]
    mean_luma = float(np.mean(y))
    bright_ratio = float(np.mean(y >= 195))
    p90 = float(np.percentile(y, 90))
    return (
        mean_luma >= 140.0
        or (mean_luma >= 125.0 and bright_ratio >= 0.10)
        or p90 >= 210.0
        or bright_ratio >= 0.18
    )


def _preserve_brightness(
    reference_bgr: np.ndarray,
    candidate_bgr: np.ndarray,
    *,
    min_ratio: float = 0.985,
    max_lift: float = 1.45,
) -> np.ndarray:
    """
    Prevent high-key / bright photos from looking darker after enhancement.
    Never allows output mean luminance below reference * min_ratio.
    """
    ref_mean = _mean_luma_bgr(reference_bgr)
    cand_yuv = cv2.cvtColor(candidate_bgr, cv2.COLOR_BGR2YUV)
    cand_y = cand_yuv[:, :, 0].astype(np.float32)
    cand_mean = float(cand_y.mean())
    if cand_mean < 1e-6:
        return candidate_bgr

    floor_mean = ref_mean * min_ratio
    if cand_mean < floor_mean:
        gain = min(max_lift, floor_mean / cand_mean)
        cand_y = np.clip(cand_y * gain, 0, 255)

    cand_yuv[:, :, 0] = cand_y.astype(np.uint8)
    return cv2.cvtColor(cand_yuv, cv2.COLOR_YUV2BGR)


def _match_luma(reference_bgr: np.ndarray, candidate_bgr: np.ndarray) -> np.ndarray:
    """
    Match overall brightness to the original image (high-key safe).
    """
    ref_yuv = cv2.cvtColor(reference_bgr, cv2.COLOR_BGR2YUV)
    cand_yuv = cv2.cvtColor(candidate_bgr, cv2.COLOR_BGR2YUV)

    ref_y = ref_yuv[:, :, 0].astype(np.float32)
    cand_y = cand_yuv[:, :, 0].astype(np.float32)

    ref_mean = float(ref_y.mean())
    cand_mean = float(cand_y.mean())
    if cand_mean > 1e-6:
        gain = ref_mean / cand_mean
        # Allow lifting darkened results; limit only strong darkening.
        gain = float(np.clip(gain, 0.96, 1.45))
    else:
        gain = 1.0

    y = np.clip(cand_y * gain, 0, 255).astype(np.uint8)
    cand_yuv[:, :, 0] = y
    out = cv2.cvtColor(cand_yuv, cv2.COLOR_YUV2BGR)
    return _preserve_brightness(reference_bgr, out)


def _tone_safe_blend(
    baseline_bgr: np.ndarray,
    enhanced_bgr: np.ndarray,
    blur_score: float,
) -> np.ndarray:
    """
    Blend enhanced output with baseline upscale to preserve natural look.
    Lower blur => more baseline. Higher blur => more enhancement.
    """
    if blur_score < 35:
        alpha = 0.72
    elif blur_score < 80:
        alpha = 0.58
    elif blur_score < 160:
        alpha = 0.42
    else:
        alpha = 0.25

    blended = cv2.addWeighted(baseline_bgr, 1.0 - alpha, enhanced_bgr, alpha, 0)
    return _match_luma(baseline_bgr, blended)


def _boost_microcontrast(bgr: np.ndarray, strength: float) -> np.ndarray:
    """
    Increase perceived detail without heavy artifacts.
    Applies local contrast on luminance + small high-pass edge boost.
    """
    if strength <= 0:
        return bgr

    is_high_key = _is_high_key_image(bgr)
    mean_luma = _mean_luma_bgr(bgr)
    if is_high_key:
        strength *= 0.40
    elif mean_luma >= 150:
        strength *= 0.55

    yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)
    y = yuv[:, :, 0]
    mean_before = float(np.mean(y))
    clip = 1.15 + strength * 0.35 if is_high_key else 1.4 + strength * 0.8
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8))
    y_clahe = clahe.apply(y)
    blend = 0.16 * strength if is_high_key else 0.26 * strength
    yuv[:, :, 0] = cv2.addWeighted(y, 1.0 - blend, y_clahe, blend, 0)
    mean_after = float(np.mean(yuv[:, :, 0]))
    if mean_after > 1e-6:
        yuv[:, :, 0] = np.clip(
            yuv[:, :, 0].astype(np.float32) + (mean_before - mean_after) * 0.95,
            0,
            255,
        ).astype(np.uint8)
    out = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)

    blurred = cv2.GaussianBlur(out, (0, 0), 1.15)
    high = cv2.subtract(out, blurred)
    edge_mix = 0.22 * strength if is_high_key else 0.40 * strength
    out = cv2.addWeighted(out, 1.0, high, edge_mix, 0)
    return np.clip(out, 0, 255).astype(np.uint8)


def _enhance_clarity(bgr: np.ndarray, blur_score: float) -> np.ndarray:
    """
    Adaptive clarity recovery for blurry / soft images.
    Strength increases automatically when input blur is detected.
    Bright / high-key images get a gentle path so whites stay bright.
    """
    h, w = bgr.shape[:2]
    pixel_count = h * w
    is_high_key = _is_high_key_image(bgr)
    mean_luma = _mean_luma_bgr(bgr)

    # Bright portraits / festival photos: avoid CLAHE+denoise that crushes highlights.
    if is_high_key and blur_score >= 95:
        amount = 0.10 if blur_score >= 160 else 0.16
        out = _unsharp_mask(bgr, amount=amount, sigma=0.85)
        return _preserve_brightness(bgr, out)

    if blur_score < 35:
        clahe_clip = 3.0
        sharpen_amount = 1.45
        sharpen_sigma = 1.35
        bilateral_d = 7
        use_denoise = True
        denoise_h = 4
        use_detail = True
        detail_sigma_s = 130.0
    elif blur_score < 80:
        clahe_clip = 2.5
        sharpen_amount = 1.05
        sharpen_sigma = 1.15
        bilateral_d = 5
        use_denoise = True
        denoise_h = 3
        use_detail = True
        detail_sigma_s = 110.0
    elif blur_score < 160:
        clahe_clip = 1.6
        sharpen_amount = 0.7
        sharpen_sigma = 1.0
        bilateral_d = 5
        use_denoise = False
        denoise_h = 2
        use_detail = False
        detail_sigma_s = 90.0
    else:
        clahe_clip = 1.2
        sharpen_amount = 0.35
        sharpen_sigma = 0.8
        bilateral_d = 3
        use_denoise = False
        denoise_h = 2
        use_detail = False
        detail_sigma_s = 80.0

    if is_high_key:
        clahe_clip = min(clahe_clip, 1.25)
        sharpen_amount = min(sharpen_amount, 0.65)
        use_denoise = False
        bilateral_d = 3

    out = cv2.bilateralFilter(bgr, bilateral_d, 45, 45)

    # Fast denoise only for blurry inputs and only on bounded image sizes.
    if use_denoise and pixel_count < 900_000 and not is_high_key:
        out = cv2.fastNlMeansDenoisingColored(
            out,
            None,
            h=denoise_h,
            hColor=denoise_h,
            templateWindowSize=5,
            searchWindowSize=11,
        )

    lab = cv2.cvtColor(out, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    l_mean_before = float(l_channel.mean())
    clahe = cv2.createCLAHE(clipLimit=clahe_clip, tileGridSize=(8, 8))
    l_channel = clahe.apply(l_channel)
    l_mean_after = float(l_channel.mean())
    if l_mean_after > 1e-6 and l_mean_before > 1e-6:
        # CLAHE often darkens high-key images — restore original brightness level.
        restore = float(np.clip(l_mean_before / l_mean_after, 0.98, 1.35))
        l_channel = np.clip(l_channel.astype(np.float32) * restore, 0, 255).astype(np.uint8)
    out = cv2.cvtColor(cv2.merge([l_channel, a_channel, b_channel]), cv2.COLOR_LAB2BGR)

    if use_detail and not is_high_key:
        out = cv2.detailEnhance(out, sigma_s=detail_sigma_s, sigma_r=0.14)

    out = _unsharp_mask(out, amount=sharpen_amount, sigma=sharpen_sigma)

    if blur_score < 50 and not is_high_key:
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
        out = cv2.filter2D(out, -1, kernel)
        out = _unsharp_mask(out, amount=0.5, sigma=0.85)

    out = np.clip(out, 0, 255).astype(np.uint8)
    return _preserve_brightness(bgr, out)


def _upscale_image_pro(raw: bytes, scale: int) -> tuple[bytes, float, str]:
    """
    Intelligent upscale + clarity recovery.
    - Detects blur level and adapts enhancement strength
    - Recovers detail before upscaling (not just resize)
    - Returns (jpeg_bytes, blur_score, enhancement_mode)
    """
    if scale not in (2, 4):
        raise ValueError("Scale must be 2 or 4.")

    if ADVANCED_UPSCALE_AVAILABLE and advanced_upscale_image_bytes is not None:
        target = "x4" if scale == 4 else "x2"

        def _run_advanced() -> tuple[bytes, float, str]:
            output_bytes, engine = advanced_upscale_image_bytes(
                raw,
                target_size=target,
                output_format="jpg",
                face_restore=False,
                api_mode=True,
            )
            bgr_for_score = _decode_upload_bgr(raw)
            blur_score = _measure_blur_score(bgr_for_score)
            return output_bytes, blur_score, engine

        try:
            from concurrent.futures import ThreadPoolExecutor
            from concurrent.futures import TimeoutError as FuturesTimeoutError

            with ThreadPoolExecutor(max_workers=1) as ai_pool:
                fut = ai_pool.submit(_run_advanced)
                try:
                    return fut.result(timeout=REALESRGAN_SOFT_TIMEOUT_SEC)
                except FuturesTimeoutError:
                    logger.warning(
                        "Real-ESRGAN exceeded %ss — using fast enhancer fallback",
                        REALESRGAN_SOFT_TIMEOUT_SEC,
                    )
                    if not ALLOW_LEGACY_UPSCALE_FALLBACK:
                        raise RuntimeError(
                            "Upscaling is taking too long on this machine. Please try again."
                        ) from None
        except Exception as exc:
            if not ALLOW_LEGACY_UPSCALE_FALLBACK:
                raise RuntimeError(f"Advanced upscaler failed: {exc}") from exc
            logger.warning("Advanced upscaler failed, falling back to legacy pipeline: %s", exc)

    if not ALLOW_LEGACY_UPSCALE_FALLBACK:
        raise RuntimeError(
            "Advanced upscaler is unavailable. Install pinned dependencies from backend/requirements.txt."
        )

    img = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = img.size
    target_w = w * scale
    target_h = h * scale

    max_edge = max(target_w, target_h)
    if max_edge > MAX_UPSCALE_OUTPUT_EDGE:
        ratio = MAX_UPSCALE_OUTPUT_EDGE / max_edge
        target_w = max(1, int(target_w * ratio))
        target_h = max(1, int(target_h * ratio))

    bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    blur_score = _measure_blur_score(bgr)

    # Enhance at a bounded working size for speed, preserving aspect ratio.
    # Use slightly larger working edge for 4x so output difference is clearly visible.
    enhance_edge = MAX_UPSCALE_ENHANCE_EDGE if scale == 4 else 1280
    work = _resize_max_edge(bgr, enhance_edge)
    enhanced = _enhance_clarity(work, blur_score)

    # Baseline upscale from ORIGINAL image preserves true detail/color character.
    baseline = cv2.resize(bgr, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    enhanced_upscaled = cv2.resize(enhanced, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    output = _tone_safe_blend(baseline, enhanced_upscaled, blur_score)

    # Extra AI-like detail boost so users can clearly see upscale improvements.
    if blur_score < 45:
        detail_strength = 1.0 if scale == 4 else 0.82
    elif blur_score < 110:
        detail_strength = 0.84 if scale == 4 else 0.68
    else:
        detail_strength = 0.62 if scale == 4 else 0.5
    output = _boost_microcontrast(output, detail_strength)

    # Final micro-sharpen after upscale for visibly clearer output.
    if blur_score < 220:
        if scale == 4:
            post_amount = 0.55 if blur_score < 80 else 0.34
        else:
            post_amount = 0.42 if blur_score < 80 else 0.24
        output = _unsharp_mask(output, amount=post_amount, sigma=0.9)

    if blur_score < 35:
        mode = "aggressive-deblur"
    elif blur_score < 80:
        mode = "strong-clarity"
    elif blur_score < 160:
        mode = "balanced-enhance"
    else:
        mode = "light-sharpen"

    rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
    out_img = Image.fromarray(rgb, mode="RGB")
    out = io.BytesIO()
    out_img.save(out, format="JPEG", quality=94, optimize=True, progressive=True)
    return out.getvalue(), blur_score, mode


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    color = (hex_color or "").strip().lstrip("#")
    if len(color) != 6:
        raise ValueError("Solid color must be a valid 6-digit hex value, e.g. #F3F4F6.")
    if any(c not in "0123456789abcdefABCDEF" for c in color):
        raise ValueError("Solid color must be a valid hex color.")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))


def _prompt_features(prompt: str) -> dict[str, bool]:
    p = (prompt or "").lower()
    return {
        "studio": any(k in p for k in ("studio", "catalog", "clean background", "ecommerce")),
        "nature": any(k in p for k in ("nature", "forest", "garden", "outdoor", "flowers")),
        "luxury": any(k in p for k in ("luxury", "premium", "royal", "editorial", "couture", "bridal", "wedding")),
        "neon": any(k in p for k in ("cyber", "neon", "night city", "futuristic")),
        "beauty": any(k in p for k in ("beauty", "fashion", "feminine", "makeup")),
        "warm": any(k in p for k in ("gold", "warm", "sunset", "champagne", "ivory", "beige")),
        "cool": any(k in p for k in ("blue", "cool", "ice", "teal")),
        "curtains": any(k in p for k in ("curtain", "drape", "fabric backdrop")),
        "floral": any(k in p for k in ("floral", "flower", "bouquet", "petals")),
        "chandelier": any(k in p for k in ("chandelier", "crystal", "hotel interior")),
        "bokeh": any(k in p for k in ("bokeh", "shallow depth", "depth of field", "cinematic")),
    }


def _prompt_theme(prompt: str) -> str:
    f = _prompt_features(prompt)
    if f["neon"]:
        return "neon"
    if f["luxury"] or f["chandelier"]:
        return "luxury"
    if f["nature"] and not f["studio"]:
        return "nature"
    if f["beauty"]:
        return "beauty"
    if f["studio"]:
        return "studio"
    if f["cool"]:
        return "cool"
    return "abstract"


def _prompt_palette(prompt: str) -> tuple[tuple[int, int, int], tuple[int, int, int], tuple[int, int, int], str]:
    theme = _prompt_theme(prompt)
    f = _prompt_features(prompt)
    if theme == "studio":
        base = ((248, 248, 246), (232, 233, 236), (210, 214, 220))
    elif theme == "nature":
        base = ((220, 238, 223), (176, 212, 186), (142, 182, 153))
    elif theme == "luxury":
        base = ((244, 232, 216), (232, 197, 156), (201, 160, 111))
    elif theme == "neon":
        base = ((34, 38, 57), (55, 75, 118), (153, 81, 208))
    elif theme == "beauty":
        base = ((247, 228, 236), (236, 196, 214), (220, 165, 191))
    elif theme == "cool":
        base = ((220, 234, 249), (184, 209, 240), (152, 179, 224))
    else:
        base = ((230, 238, 248), (194, 214, 238), (161, 183, 214))

    c1, c2, c3 = [np.array(c, dtype=np.float32) for c in base]
    # Apply prompt-level warm/cool bias from long custom prompts.
    if f["warm"] and not f["neon"]:
        bias = np.array([8.0, 2.0, -8.0], dtype=np.float32)
        c1 += bias
        c2 += bias
        c3 += bias
    elif f["cool"]:
        bias = np.array([-6.0, 2.0, 8.0], dtype=np.float32)
        c1 += bias
        c2 += bias
        c3 += bias

    c1 = np.clip(c1, 0, 255).astype(np.uint8)
    c2 = np.clip(c2, 0, 255).astype(np.uint8)
    c3 = np.clip(c3, 0, 255).astype(np.uint8)
    return (int(c1[0]), int(c1[1]), int(c1[2])), (int(c2[0]), int(c2[1]), int(c2[2])), (int(c3[0]), int(c3[1]), int(c3[2])), theme


def _generate_prompt_background(size: tuple[int, int], prompt: str) -> np.ndarray:
    w, h = size
    c1, c2, c3, theme = _prompt_palette(prompt)
    f = _prompt_features(prompt)
    y = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    x = np.linspace(0.0, 1.0, w, dtype=np.float32)[None, :]
    grad = np.zeros((h, w, 3), dtype=np.float32)
    c1a = np.array(c1, dtype=np.float32)
    c2a = np.array(c2, dtype=np.float32)
    c3a = np.array(c3, dtype=np.float32)
    base_mix = (0.65 * y + 0.35 * x).astype(np.float32)
    grad = c1a * (1.0 - base_mix[..., None]) + c2a * base_mix[..., None]

    # Key light hotspot to mimic scene depth.
    radial = np.sqrt((x - 0.70) ** 2 + (y - 0.24) ** 2)
    radial = np.clip(1.0 - radial * 1.55, 0.0, 1.0)
    grad += (c3a - c2a) * (radial[..., None] * 0.68)

    seed = int(hashlib.md5(prompt.encode("utf-8")).hexdigest()[:8], 16) if prompt else 1315423911
    rng = np.random.default_rng(seed)

    # Bokeh / blobs for clear visual difference in prompt mode.
    circles = 16 if (f["bokeh"] or f["luxury"]) else (12 if w * h <= 2_000_000 else 8)
    canvas = grad.copy()
    for _ in range(circles):
        cx = int(rng.integers(0, w))
        cy = int(rng.integers(0, h))
        radius = int(rng.integers(max(36, min(w, h) // 14), max(84, min(w, h) // 6)))
        alpha = float(rng.uniform(0.08, 0.22 if f["bokeh"] else 0.18))
        color = np.array(
            [
                int(np.clip(c2[0] + rng.integers(-20, 21), 0, 255)),
                int(np.clip(c2[1] + rng.integers(-20, 21), 0, 255)),
                int(np.clip(c2[2] + rng.integers(-20, 21), 0, 255)),
            ],
            dtype=np.float32,
        )
        yy, xx = np.ogrid[:h, :w]
        mask = ((xx - cx) ** 2 + (yy - cy) ** 2) <= radius * radius
        canvas[mask] = canvas[mask] * (1.0 - alpha) + color * alpha

    # Theme-specific structure (so prompt mode is not plain solid).
    canvas_u8 = np.clip(canvas, 0, 255).astype(np.uint8)
    bgr = cv2.cvtColor(canvas_u8, cv2.COLOR_RGB2BGR)

    if theme == "studio":
        # Soft floor ellipse under subject area.
        overlay = bgr.copy()
        cv2.ellipse(
            overlay,
            center=(w // 2, int(h * 0.83)),
            axes=(max(40, w // 4), max(12, h // 18)),
            angle=0,
            startAngle=0,
            endAngle=360,
            color=(max(0, c2[2] - 18), max(0, c2[1] - 18), max(0, c2[0] - 18)),
            thickness=-1,
        )
        bgr = cv2.addWeighted(bgr, 0.9, overlay, 0.1, 0)
    elif theme == "nature":
        # Vertical soft streaks like distant foliage.
        for i in range(8):
            x0 = int((i + 0.5) * w / 8)
            cv2.line(
                bgr,
                (x0, 0),
                (x0 + int(rng.integers(-12, 13)), h),
                color=(65 + int(rng.integers(0, 20)), 120 + int(rng.integers(0, 35)), 70 + int(rng.integers(0, 20))),
                thickness=max(2, w // 170),
                lineType=cv2.LINE_AA,
            )
        bgr = cv2.GaussianBlur(bgr, (0, 0), sigmaX=2.2)
    elif theme == "neon":
        # Subtle neon grid lines.
        step = max(36, min(w, h) // 11)
        grid = bgr.copy()
        for gx in range(0, w, step):
            cv2.line(grid, (gx, 0), (gx, h), (130, 60, 180), 1, cv2.LINE_AA)
        for gy in range(0, h, step):
            cv2.line(grid, (0, gy), (w, gy), (95, 55, 150), 1, cv2.LINE_AA)
        bgr = cv2.addWeighted(bgr, 0.84, grid, 0.16, 0)

    if f["curtains"]:
        # Soft vertical curtain folds.
        curtain = np.zeros_like(bgr, dtype=np.float32)
        fold_count = 7
        for i in range(fold_count):
            center = int((i + 0.5) * w / fold_count)
            sigma = max(24.0, w / 18.0)
            profile = np.exp(-((np.arange(w, dtype=np.float32) - center) ** 2) / (2.0 * sigma * sigma))
            profile = np.tile(profile[None, :], (h, 1))
            curtain[:, :, 0] += profile * 9.0
            curtain[:, :, 1] += profile * 9.0
            curtain[:, :, 2] += profile * 11.0
        bgr = np.clip(bgr.astype(np.float32) + curtain, 0, 255).astype(np.uint8)

    if f["floral"]:
        # Floral depth clusters (blurred pink/cream blobs).
        floral_overlay = bgr.copy()
        flower_count = 20 if w * h <= 2_000_000 else 14
        for _ in range(flower_count):
            cx = int(rng.integers(0, w))
            cy = int(rng.integers(int(h * 0.28), h))
            r = int(rng.integers(max(10, min(w, h) // 32), max(22, min(w, h) // 14)))
            color = (
                int(rng.integers(185, 236)),  # B
                int(rng.integers(182, 230)),  # G
                int(rng.integers(210, 252)),  # R
            )
            cv2.circle(floral_overlay, (cx, cy), r, color, -1, cv2.LINE_AA)
        floral_overlay = cv2.GaussianBlur(floral_overlay, (0, 0), sigmaX=2.8)
        bgr = cv2.addWeighted(bgr, 0.78, floral_overlay, 0.22, 0)

    if f["chandelier"]:
        # Warm chandelier sparkle points near top area.
        sparkle_overlay = bgr.copy()
        sparkles = 28
        for _ in range(sparkles):
            sx = int(rng.integers(int(w * 0.12), int(w * 0.88)))
            sy = int(rng.integers(0, int(h * 0.36)))
            sr = int(rng.integers(1, 4))
            cv2.circle(sparkle_overlay, (sx, sy), sr, (126, 206, 248), -1, cv2.LINE_AA)
        sparkle_overlay = cv2.GaussianBlur(sparkle_overlay, (0, 0), sigmaX=1.8)
        bgr = cv2.addWeighted(bgr, 0.9, sparkle_overlay, 0.1, 0)

    noise = rng.normal(0.0, 1.5, size=(h, w, 3)).astype(np.float32)
    bgr = np.clip(bgr.astype(np.float32) + noise, 0, 255).astype(np.uint8)

    # Keep it premium and smooth, but clearly not solid.
    bgr = cv2.GaussianBlur(bgr, (0, 0), sigmaX=1.2)
    return bgr


def _compose_generated_background(raw: bytes, prompt: str, solid_color: str) -> tuple[bytes, str, str]:
    """
    Advanced generation pipeline:
    1) remove real background
    2) generate prompt/solid background
    3) blend subject with soft shadow for realism
    """
    cutout_png, used_model = _remove_background_pro(raw)
    subject_rgba = Image.open(io.BytesIO(cutout_png)).convert("RGBA")
    w, h = subject_rgba.size

    if solid_color.strip():
        rgb = _hex_to_rgb(solid_color)
        bg_bgr = np.full((h, w, 3), (rgb[2], rgb[1], rgb[0]), dtype=np.uint8)
        bg_mode = "solid"
    else:
        bg_bgr = _generate_prompt_background((w, h), prompt)
        bg_mode = "prompt"

    subj = np.array(subject_rgba, dtype=np.uint8)
    alpha = subj[:, :, 3].astype(np.float32) / 255.0
    subj_bgr = cv2.cvtColor(subj[:, :, :3], cv2.COLOR_RGB2BGR)

    # Soft shadow behind subject to avoid cutout look.
    shadow_alpha = cv2.GaussianBlur((alpha * 255).astype(np.uint8), (0, 0), sigmaX=7.5).astype(np.float32) / 255.0
    shadow = np.zeros_like(bg_bgr, dtype=np.float32)
    shadow[:] = (18, 18, 18)
    bg = bg_bgr.astype(np.float32)
    bg = bg * (1.0 - shadow_alpha[..., None] * 0.16) + shadow * (shadow_alpha[..., None] * 0.16)

    # Subject blend.
    comp = subj_bgr.astype(np.float32) * alpha[..., None] + bg * (1.0 - alpha[..., None])
    comp = np.clip(comp, 0, 255).astype(np.uint8)
    comp = cv2.bilateralFilter(comp, 3, 24, 24)

    out = io.BytesIO()
    Image.fromarray(cv2.cvtColor(comp, cv2.COLOR_BGR2RGB), mode="RGB").save(
        out, format="JPEG", quality=94, optimize=True, progressive=True
    )
    return out.getvalue(), used_model, bg_mode


def _decode_upload_bgr(raw: bytes) -> np.ndarray:
    pil = Image.open(io.BytesIO(raw))
    pil = ImageOps.exif_transpose(pil).convert("RGB")
    rgb = np.asarray(pil, dtype=np.uint8)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def _decode_upload_mask(mask_raw: bytes, height: int, width: int) -> np.ndarray:
    arr = np.frombuffer(mask_raw, dtype=np.uint8)
    decoded = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    if decoded is None:
        raise ValueError("Could not decode mask image.")
    if decoded.shape[0] != height or decoded.shape[1] != width:
        decoded = cv2.resize(decoded, (width, height), interpolation=cv2.INTER_NEAREST)
    _, mask = cv2.threshold(decoded, 127, 255, cv2.THRESH_BINARY)
    if int(mask.max()) == 0:
        raise ValueError("Please paint the watermark area you want to remove.")
    return mask


def _match_luma_in_ring(reference_bgr: np.ndarray, candidate_bgr: np.ndarray, ring_mask: np.ndarray) -> np.ndarray:
    """Match brightness of inpainted fill to surrounding pixels so colors stay natural."""
    if cv2.countNonZero(ring_mask) < 16:
        return candidate_bgr
    ref_yuv = cv2.cvtColor(reference_bgr, cv2.COLOR_BGR2YUV)
    cand_yuv = cv2.cvtColor(candidate_bgr, cv2.COLOR_BGR2YUV)
    ring = ring_mask > 0
    ref_mean = float(ref_yuv[ring, 0].mean())
    cand_mean = float(cand_yuv[ring, 0].mean())
    gain = float(np.clip(ref_mean / cand_mean, 0.9, 1.1)) if cand_mean > 1e-6 else 1.0
    y = np.clip(cand_yuv[:, :, 0].astype(np.float32) * gain, 0, 255).astype(np.uint8)
    cand_yuv[:, :, 0] = y
    return cv2.cvtColor(cand_yuv, cv2.COLOR_YUV2BGR)


def _match_color_in_ring(
    reference_bgr: np.ndarray,
    candidate_bgr: np.ndarray,
    ring_mask: np.ndarray,
) -> np.ndarray:
    """Match fill colors to the border around the selection so removal looks natural."""
    if cv2.countNonZero(ring_mask) < 12:
        return candidate_bgr
    ring = ring_mask > 0
    out = candidate_bgr.copy().astype(np.float32)
    ref = reference_bgr.astype(np.float32)
    for c in range(3):
        ref_mean = float(ref[:, :, c][ring].mean())
        cand_mean = float(out[:, :, c][ring].mean())
        if cand_mean > 1e-6:
            gain = float(np.clip(ref_mean / cand_mean, 0.85, 1.15))
            out[:, :, c] *= gain
    return np.clip(out, 0, 255).astype(np.uint8)


def _remove_light_watermark(bgr: np.ndarray, user_mask: np.ndarray) -> tuple[np.ndarray, float]:
    """
    Recover background under semi-transparent white watermarks.
    Model: pixel = (1 - alpha) * background + alpha * 255
    Only pixels brighter than the surrounding border are modified.
    """
    mask = user_mask > 0
    bgr_f = bgr.astype(np.float32)

    ring_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    ring = cv2.subtract(cv2.dilate(user_mask, ring_kernel, iterations=1), user_mask) > 0
    if np.count_nonzero(ring) < 12:
        ring = ~mask

    ring_y = cv2.cvtColor(bgr[ring].reshape(-1, 1, 3), cv2.COLOR_BGR2YUV)[:, 0, 0]
    ring_lum = float(np.median(ring_y))

    ref_mask = cv2.dilate(user_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=1)
    bg_est = cv2.inpaint(bgr, ref_mask, inpaintRadius=2, flags=cv2.INPAINT_NS).astype(np.float32)

    obs = bgr_f[mask]
    bg = bg_est[mask]
    obs_lum = 0.114 * obs[:, 0] + 0.587 * obs[:, 1] + 0.299 * obs[:, 2]

    alpha = np.zeros(obs.shape[0], dtype=np.float32)
    for c in range(3):
        channel_alpha = (obs[:, c] - bg[:, c]) / (255.0 - bg[:, c] + 1e-4)
        alpha += np.clip(channel_alpha, 0.0, 1.0)
    alpha = alpha / 3.0

    recovered = obs.copy()
    wm_pixels = (alpha >= 0.10) & (obs_lum > ring_lum + 12.0)
    if np.any(wm_pixels):
        a = np.clip(alpha[wm_pixels], 0.06, 0.92)
        for c in range(3):
            recovered[wm_pixels, c] = (obs[wm_pixels, c] - a * 255.0) / (1.0 - a + 1e-6)
        recovered[wm_pixels] = np.clip(recovered[wm_pixels], 0, 255)

    out = bgr_f.copy()
    out[mask] = recovered
    avg_alpha = float(alpha[wm_pixels].mean()) if np.any(wm_pixels) else 0.0
    return out.astype(np.uint8), avg_alpha


def _remove_dark_mark(bgr: np.ndarray, user_mask: np.ndarray) -> np.ndarray:
    """Small solid marks: minimal inpaint inside mask only."""
    inpaint_mask = cv2.dilate(user_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=1)
    filled = cv2.inpaint(bgr, inpaint_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    out = bgr.copy()
    out[user_mask > 0] = filled[user_mask > 0]
    return out


def _inpaint_natural(bgr: np.ndarray, inpaint_mask: np.ndarray, user_mask: np.ndarray) -> np.ndarray:
    """
    Smart removal: deblend white/semi-transparent overlays (preserves texture),
    tiny inpaint for small solid dark marks. No blur smearing.
    """
    _ = inpaint_mask
    user_u8 = user_mask.astype(np.uint8)
    if cv2.countNonZero(user_u8) < 1:
        return bgr.copy()

    deblended, avg_alpha = _remove_light_watermark(bgr, user_u8)

    if avg_alpha >= 0.08:
        return deblended

    total = float(bgr.shape[0] * bgr.shape[1])
    ratio = float(cv2.countNonZero(user_u8)) / total
    if ratio <= 0.06:
        return _remove_dark_mark(bgr, user_u8)

    return deblended


def _border_mean_fill(bgr: np.ndarray, user_mask: np.ndarray) -> np.ndarray:
    """Fill masked pixels with average color sampled from the surrounding border."""
    ring_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))
    ring = cv2.subtract(cv2.dilate(user_mask, ring_kernel, iterations=1), user_mask)
    if cv2.countNonZero(ring) < 8 or cv2.countNonZero(user_mask) < 4:
        return bgr.copy()

    ring_pixels = bgr[ring > 0].astype(np.float32)
    mean_color = ring_pixels.mean(axis=0)
    out = bgr.copy()
    out[user_mask > 0] = mean_color
    return out


def _remove_watermark_pro(raw: bytes, mask_raw: bytes) -> bytes:
    """
    Remove watermark only inside the user mask.
    Every pixel outside the mask is copied verbatim — lossless PNG output avoids
    re-compression damage to the rest of the photo.
    """
    if LAMA_WATERMARK_AVAILABLE and lama_remove_watermark_bytes is not None:
        try:
            return lama_remove_watermark_bytes(raw, mask_raw)
        except Exception:
            # Graceful fallback to deterministic classic path.
            pass

    original_bgr = _decode_upload_bgr(raw)
    orig_h, orig_w = original_bgr.shape[:2]

    mask_full = _decode_upload_mask(mask_raw, orig_h, orig_w)
    user_bool = mask_full > 0

    ys, xs = np.where(user_bool)
    pad = max(24, int(max(orig_w, orig_h) * 0.03))
    x1 = max(0, int(xs.min()) - pad)
    x2 = min(orig_w, int(xs.max()) + 1 + pad)
    y1 = max(0, int(ys.min()) - pad)
    y2 = min(orig_h, int(ys.max()) + 1 + pad)

    crop_bgr = original_bgr[y1:y2, x1:x2]
    crop_user = mask_full[y1:y2, x1:x2]

    kernel3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    crop_inpaint_mask = cv2.dilate(crop_user, kernel3, iterations=1)

    filled_crop = _inpaint_natural(crop_bgr, crop_inpaint_mask, crop_user)

    final = original_bgr.copy()
    crop_result = filled_crop
    # Strict: pixels outside user mask in crop stay exactly original
    strict = crop_bgr.copy()
    strict[crop_user > 0] = crop_result[crop_user > 0]
    final[y1:y2, x1:x2] = strict

    out = io.BytesIO()
    Image.fromarray(cv2.cvtColor(final, cv2.COLOR_BGR2RGB), mode="RGB").save(
        out, format="PNG", compress_level=3, optimize=True
    )
    return out.getvalue()


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
def _warmup_advanced_upscale() -> None:
    """Load Real-ESRGAN once at startup so /upscale fails fast with a clear log."""
    global advanced_upscale_ready, advanced_upscale_error
    if not ADVANCED_UPSCALE_AVAILABLE or advanced_upscale_image_bytes is None:
        advanced_upscale_ready = False
        advanced_upscale_error = "advanced_upscale module not importable"
        logger.warning(
            "Advanced upscale unavailable at import. Run: python main.py --setup "
            "(Python: %s)",
            sys.executable,
        )
        return
    try:
        from advanced_upscale import UpscaleConfig, _get_cached_upsampler

        _get_cached_upsampler(UpscaleConfig(target_size="x2"))
        advanced_upscale_ready = True
        advanced_upscale_error = None
        logger.info("Real-ESRGAN upscaler ready (Python: %s)", sys.executable)
    except Exception as exc:
        advanced_upscale_ready = False
        advanced_upscale_error = str(exc)
        logger.error("Real-ESRGAN failed to load: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Backend Python: %s", sys.executable)
    cleanup_expired_files()
    _load_rembg_sessions()
    try:
        from cms_database import init_db

        init_db()
        logger.info("CMS database initialized")
    except Exception as exc:
        logger.error("CMS database init failed: %s", exc)
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(executor, _warmup_advanced_upscale)
    yield
    upscale_executor.shutdown(wait=False, cancel_futures=True)
    executor.shutdown(wait=False, cancel_futures=True)


app = FastAPI(
    title="FBR AI Background Remover API",
    version="2.0.0",
    description="Professional AI background removal — preserves text, logos, and fine details.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

BLOG_MEDIA_DIR = BASE_DIR / "blog_media"
BLOG_MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/blog-media", StaticFiles(directory=str(BLOG_MEDIA_DIR)), name="blog-media")

CMS_LOADED = False
CMS_LOAD_ERROR: str | None = None

try:
    from cms_api import cms_router

    app.include_router(cms_router)
    CMS_LOADED = True
except Exception as exc:
    CMS_LOAD_ERROR = str(exc)
    logger.error("CMS router failed to load: %s", exc)


@app.get("/")
def root() -> dict[str, Any]:
    image_endpoints = (
        "POST /remove-bg, POST /blur-background, POST /enhance-image, "
        "POST /upscale, POST /generate-background, POST /remove-watermark"
    )
    cms_endpoints = (
        "GET/POST/DELETE /api/admin/users, GET /api/admin/dashboard, "
        "GET/POST/PUT/DELETE /api/admin/blog, POST /api/admin/media/upload, "
        "GET /api/admin/newsletter, GET /api/blog, POST /api/newsletter/subscribe"
    )
    return {
        "message": "FBR AI image API is running",
        "build": API_BUILD,
        "model": active_model_name,
        "python": sys.executable,
        "cms_loaded": CMS_LOADED,
        "cms_error": CMS_LOAD_ERROR,
        "endpoints": f"{image_endpoints}; {cms_endpoints}" if CMS_LOADED else image_endpoints,
    }


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "build": API_BUILD,
        "python": sys.executable,
        "models_loaded": list(rembg_sessions.keys()),
        "default_model": active_model_name,
        "alpha_matting": ALPHA_MATTING,
        "advanced_upscale_available": ADVANCED_UPSCALE_AVAILABLE,
        "advanced_upscale_ready": advanced_upscale_ready,
        "advanced_upscale_error": advanced_upscale_error,
        "cms_loaded": CMS_LOADED,
        "cms_error": CMS_LOAD_ERROR,
    }


@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)) -> dict[str, Any]:
    """
    Upload an image → receive original + transparent PNG URLs.

    Foreground content (subjects, text, logos, graphics) is preserved.
    Only the background is removed.
    """
    cleanup_expired_files()

    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WebP images are supported.",
        )

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit.")

    try:
        Image.open(io.BytesIO(raw)).verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.") from exc

    job_id = uuid.uuid4().hex
    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    original_ext = ext_map.get(content_type, "jpg")
    original_name = f"{job_id}_original.{original_ext}"
    processed_name = f"{job_id}_processed.png"
    original_path = UPLOAD_DIR / original_name
    processed_path = UPLOAD_DIR / processed_name

    try:
        _save_original(raw, content_type, original_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc

    started = time.perf_counter()
    try:
        loop = asyncio.get_running_loop()
        # No asyncio timeout — large images must be allowed to finish (same as upscale).
        output_bytes, used_model = await loop.run_in_executor(executor, _remove_background_pro, raw)
        processed_path.write_bytes(output_bytes)
    except Exception as exc:
        original_path.unlink(missing_ok=True)
        processed_path.unlink(missing_ok=True)
        logger.exception("Background removal failed")
        raise HTTPException(
            status_code=500,
            detail=f"Background removal failed: {exc}",
        ) from exc

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    logger.info("Processed %s in %dms (job %s)", file.filename or "image", elapsed_ms, job_id)

    return {
        "job_id": job_id,
        "original_image_url": f"/uploads/{original_name}",
        "processed_image_url": f"/uploads/{processed_name}",
        "original_filename": file.filename or original_name,
        "processing_time_ms": elapsed_ms,
        "model": used_model,
        "format": "png",
        "transparent": True,
    }


@app.post("/blur-background")
async def blur_background(file: UploadFile = File(...), intensity: int = Form(55)) -> dict[str, Any]:
    """
    Upload image and blur background only, while subject stays clear.
    """
    cleanup_expired_files()

    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are supported.")

    if intensity < 0 or intensity > 100:
        raise HTTPException(status_code=400, detail="Intensity must be between 0 and 100.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit.")

    try:
        Image.open(io.BytesIO(raw)).verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.") from exc

    job_id = uuid.uuid4().hex
    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    original_ext = ext_map.get(content_type, "jpg")
    original_name = f"{job_id}_blur_original.{original_ext}"
    processed_name = f"{job_id}_blur_{intensity}.jpg"
    original_path = UPLOAD_DIR / original_name
    processed_path = UPLOAD_DIR / processed_name

    try:
        _save_original(raw, content_type, original_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc

    started = time.perf_counter()
    try:
        loop = asyncio.get_running_loop()
        output_bytes, used_model = await loop.run_in_executor(
            executor, _blur_background_pro, raw, intensity
        )
        processed_path.write_bytes(output_bytes)
    except Exception as exc:
        original_path.unlink(missing_ok=True)
        processed_path.unlink(missing_ok=True)
        logger.exception("Blur background failed")
        raise HTTPException(status_code=500, detail=f"Blur background failed: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    logger.info(
        "Blurred background for %s in %dms (job %s, intensity=%d)",
        file.filename or "image",
        elapsed_ms,
        job_id,
        intensity,
    )

    return {
        "job_id": job_id,
        "original_image_url": f"/uploads/{original_name}",
        "processed_image_url": f"/uploads/{processed_name}",
        "original_filename": file.filename or original_name,
        "processing_time_ms": elapsed_ms,
        "intensity": intensity,
        "model": used_model,
        "format": "jpg",
    }


@app.post("/enhance-image")
async def enhance_image(file: UploadFile = File(...), sharpen: int = Form(40), denoise: int = Form(25)) -> dict[str, Any]:
    """
    Upload image and run advanced enhancement (clarity + denoise + sharpen).
    """
    cleanup_expired_files()

    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are supported.")

    if sharpen < 0 or sharpen > 100 or denoise < 0 or denoise > 100:
        raise HTTPException(status_code=400, detail="Sharpen and denoise must be between 0 and 100.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit.")

    try:
        Image.open(io.BytesIO(raw)).verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.") from exc

    job_id = uuid.uuid4().hex
    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    original_ext = ext_map.get(content_type, "jpg")
    original_name = f"{job_id}_enhance_original.{original_ext}"
    processed_name = f"{job_id}_enhanced.jpg"
    original_path = UPLOAD_DIR / original_name
    processed_path = UPLOAD_DIR / processed_name

    try:
        _save_original(raw, content_type, original_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc

    started = time.perf_counter()
    try:
        loop = asyncio.get_running_loop()
        output_bytes, blur_score, enhancement_mode = await loop.run_in_executor(
            upscale_executor, _enhance_image_pro, raw, sharpen, denoise
        )
        processed_path.write_bytes(output_bytes)
    except Exception as exc:
        original_path.unlink(missing_ok=True)
        processed_path.unlink(missing_ok=True)
        logger.exception("Enhance image failed")
        raise HTTPException(status_code=500, detail=f"Enhance image failed: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    logger.info(
        "Enhanced %s in %dms (job %s, blur=%.1f, mode=%s, sharpen=%d, denoise=%d)",
        file.filename or "image",
        elapsed_ms,
        job_id,
        blur_score,
        enhancement_mode,
        sharpen,
        denoise,
    )

    return {
        "job_id": job_id,
        "original_image_url": f"/uploads/{original_name}",
        "processed_image_url": f"/uploads/{processed_name}",
        "original_filename": file.filename or original_name,
        "processing_time_ms": elapsed_ms,
        "sharpen": sharpen,
        "denoise": denoise,
        "blur_score": round(blur_score, 1),
        "enhancement_mode": enhancement_mode,
        "engine": enhancement_mode,
        "format": "jpg",
    }


@app.post("/upscale")
async def upscale_image(file: UploadFile = File(...), scale: int = Form(2)) -> dict[str, Any]:
    """
    Upload image and upscale dynamically with scale 2 or 4.
    Returns original + processed URLs.
    """
    cleanup_expired_files()

    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are supported.")

    if scale not in (2, 4):
        raise HTTPException(status_code=400, detail="Scale must be 2 or 4.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit.")

    try:
        Image.open(io.BytesIO(raw)).verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.") from exc

    job_id = uuid.uuid4().hex
    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    original_ext = ext_map.get(content_type, "jpg")
    original_name = f"{job_id}_upscale_original.{original_ext}"
    processed_name = f"{job_id}_upscale_{scale}x.jpg"
    original_path = UPLOAD_DIR / original_name
    processed_path = UPLOAD_DIR / processed_name

    try:
        _save_original(raw, content_type, original_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc

    started = time.perf_counter()
    try:
        loop = asyncio.get_running_loop()
        # No asyncio timeout — large CPU upscales must be allowed to finish (or soft-fallback inside worker).
        output_bytes, blur_score, enhancement_mode = await loop.run_in_executor(
            upscale_executor,
            _upscale_image_pro,
            raw,
            scale,
        )
        processed_path.write_bytes(output_bytes)
    except Exception as exc:
        original_path.unlink(missing_ok=True)
        processed_path.unlink(missing_ok=True)
        logger.exception("Upscale failed")
        raise HTTPException(status_code=500, detail=f"Upscale failed: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    logger.info(
        "Upscaled %s to %dx in %dms (job %s, blur=%.1f, mode=%s)",
        file.filename or "image",
        scale,
        elapsed_ms,
        job_id,
        blur_score,
        enhancement_mode,
    )

    return {
        "job_id": job_id,
        "original_image_url": f"/uploads/{original_name}",
        "processed_image_url": f"/uploads/{processed_name}",
        "original_filename": file.filename or original_name,
        "processing_time_ms": elapsed_ms,
        "scale": scale,
        "format": "jpg",
        "blur_score": round(blur_score, 1),
        "enhancement_mode": enhancement_mode,
    }


@app.post("/generate-background")
async def generate_background(
    file: UploadFile = File(...),
    prompt: str = Form(""),
    solid_color: str = Form(""),
) -> dict[str, Any]:
    """
    Upload image, remove real background, then generate a new background
    from prompt or solid color.
    """
    cleanup_expired_files()

    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are supported.")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit.")

    try:
        Image.open(io.BytesIO(raw)).verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.") from exc

    if solid_color.strip():
        # validate color early
        try:
            _hex_to_rgb(solid_color)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    job_id = uuid.uuid4().hex
    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    original_ext = ext_map.get(content_type, "jpg")
    original_name = f"{job_id}_genbg_original.{original_ext}"
    processed_name = f"{job_id}_genbg_result.jpg"
    original_path = UPLOAD_DIR / original_name
    processed_path = UPLOAD_DIR / processed_name

    try:
        _save_original(raw, content_type, original_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc

    started = time.perf_counter()
    try:
        loop = asyncio.get_running_loop()
        output_bytes, used_model, bg_mode = await loop.run_in_executor(
            executor, _compose_generated_background, raw, prompt, solid_color
        )
        processed_path.write_bytes(output_bytes)
    except Exception as exc:
        original_path.unlink(missing_ok=True)
        processed_path.unlink(missing_ok=True)
        logger.exception("Generate background failed")
        raise HTTPException(status_code=500, detail=f"Background generation failed: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    logger.info(
        "Generated background for %s in %dms (job %s, mode=%s, rm-model=%s)",
        file.filename or "image",
        elapsed_ms,
        job_id,
        bg_mode,
        used_model,
    )

    return {
        "job_id": job_id,
        "original_image_url": f"/uploads/{original_name}",
        "processed_image_url": f"/uploads/{processed_name}",
        "original_filename": file.filename or original_name,
        "processing_time_ms": elapsed_ms,
        "background_mode": bg_mode,
        "model": used_model,
        "format": "jpg",
    }


@app.post("/remove-watermark")
async def remove_watermark(
    file: UploadFile = File(...),
    mask: UploadFile = File(...),
) -> dict[str, Any]:
    """
    Upload image + user-painted mask (white = remove, black = keep).
    Only the masked region is inpainted; the rest of the image is preserved.
    """
    cleanup_expired_files()

    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are supported.")

    mask_type = mask.content_type or ""
    if mask_type not in ("image/png", "image/jpeg", "image/webp", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Mask must be a PNG image.")

    raw = await file.read()
    mask_raw = await mask.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if not mask_raw:
        raise HTTPException(status_code=400, detail="Mask is empty. Paint the watermark area first.")
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit.")
    if len(mask_raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=400, detail="Mask file is too large.")

    try:
        Image.open(io.BytesIO(raw)).verify()
        Image.open(io.BytesIO(mask_raw)).verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image/mask file.") from exc

    job_id = uuid.uuid4().hex
    ext_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    original_ext = ext_map.get(content_type, "jpg")
    original_name = f"{job_id}_wm_original.{original_ext}"
    processed_name = f"{job_id}_wm_clean.png"
    original_path = UPLOAD_DIR / original_name
    processed_path = UPLOAD_DIR / processed_name

    try:
        _save_original(raw, content_type, original_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}") from exc

    started = time.perf_counter()
    try:
        loop = asyncio.get_running_loop()
        output_bytes = await loop.run_in_executor(executor, _remove_watermark_pro, raw, mask_raw)
        processed_path.write_bytes(output_bytes)
    except ValueError as exc:
        original_path.unlink(missing_ok=True)
        processed_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        original_path.unlink(missing_ok=True)
        processed_path.unlink(missing_ok=True)
        logger.exception("Watermark removal failed")
        raise HTTPException(status_code=500, detail=f"Watermark removal failed: {exc}") from exc

    elapsed_ms = round((time.perf_counter() - started) * 1000)
    logger.info("Removed watermark from %s in %dms (job %s)", file.filename or "image", elapsed_ms, job_id)

    return {
        "job_id": job_id,
        "original_image_url": f"/uploads/{original_name}",
        "processed_image_url": f"/uploads/{processed_name}",
        "original_filename": file.filename or original_name,
        "processing_time_ms": elapsed_ms,
        "format": "png",
    }


if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    logger.info("Starting FBR AI API on http://%s:%s", host, port)
    uvicorn.run(app, host=host, port=port, reload=False)
