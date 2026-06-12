from __future__ import annotations

import io
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from PIL import Image, ImageOps

_LAMA_MODEL = None
_LAMA_AVAILABLE = False

try:
    from simple_lama_inpainting import SimpleLama

    _LAMA_AVAILABLE = True
except Exception:
    SimpleLama = None


def _get_lama():
    global _LAMA_MODEL
    if not _LAMA_AVAILABLE or SimpleLama is None:
        raise RuntimeError("LaMa backend is unavailable.")
    if _LAMA_MODEL is None:
        _LAMA_MODEL = SimpleLama()
    return _LAMA_MODEL


def _read_rgb(path: str | Path) -> np.ndarray:
    pil = Image.open(path)
    pil = ImageOps.exif_transpose(pil).convert("RGB")
    return np.asarray(pil, dtype=np.uint8)


def _mask_to_binary(mask: np.ndarray, h: int, w: int) -> np.ndarray:
    if mask.ndim == 3:
        mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
    if mask.shape[:2] != (h, w):
        mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)
    _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    if int(mask.max()) == 0:
        raise ValueError("Mask has no selected area.")
    return mask.astype(np.uint8)


def _pad_for_model(rgb: np.ndarray, mask: np.ndarray, mult: int = 8) -> tuple[np.ndarray, np.ndarray, tuple[int, int]]:
    h, w = rgb.shape[:2]
    pad_h = (mult - (h % mult)) % mult
    pad_w = (mult - (w % mult)) % mult
    if pad_h == 0 and pad_w == 0:
        return rgb, mask, (h, w)

    rgb_pad = cv2.copyMakeBorder(rgb, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT_101)
    mask_pad = cv2.copyMakeBorder(mask, 0, pad_h, 0, pad_w, cv2.BORDER_CONSTANT, value=0)
    return rgb_pad, mask_pad, (h, w)


def _ring_mask(mask: np.ndarray, k: int) -> np.ndarray:
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    ring = cv2.subtract(cv2.dilate(mask, kernel, iterations=1), mask)
    return (ring > 0).astype(np.uint8)


def _texture_tone_match(src_rgb: np.ndarray, repaired_rgb: np.ndarray, mask: np.ndarray) -> np.ndarray:
    out = repaired_rgb.copy()
    ring = _ring_mask(mask, 21)
    if int(ring.sum()) < 32:
        return out

    src_lab = cv2.cvtColor(src_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    rep_lab = cv2.cvtColor(repaired_rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    r = ring > 0

    for c in range(3):
        src_mean = float(src_lab[:, :, c][r].mean())
        src_std = float(src_lab[:, :, c][r].std() + 1e-6)
        rep_mean = float(rep_lab[:, :, c][r].mean())
        rep_std = float(rep_lab[:, :, c][r].std() + 1e-6)
        rep_lab[:, :, c] = ((rep_lab[:, :, c] - rep_mean) * (src_std / rep_std)) + src_mean

    matched = np.clip(rep_lab, 0, 255).astype(np.uint8)
    matched = cv2.cvtColor(matched, cv2.COLOR_LAB2RGB)

    feather = cv2.GaussianBlur(mask.astype(np.float32) / 255.0, (0, 0), sigmaX=1.2)
    feather = np.clip(feather, 0.0, 1.0)[..., None]
    out = np.clip(src_rgb.astype(np.float32) * (1.0 - feather) + matched.astype(np.float32) * feather, 0, 255).astype(
        np.uint8
    )
    return out


def _run_lama(rgb: np.ndarray, mask: np.ndarray) -> np.ndarray:
    lama = _get_lama()
    image_pil = Image.fromarray(rgb, mode="RGB")
    mask_pil = Image.fromarray(mask, mode="L")
    repaired_pil = lama(image_pil, mask_pil)
    repaired = np.asarray(repaired_pil.convert("RGB"), dtype=np.uint8)
    return repaired


def remove_watermark(image_path: str | Path, mask_path: str | Path, output_path: str | Path) -> bool:
    """
    Remove a user-selected watermark/object region with LaMa inpainting.
    White mask area = remove.
    Returns True on success, False on graceful failure.
    """
    try:
        rgb = _read_rgb(image_path)
        mask_raw = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
        if mask_raw is None:
            return False
        h, w = rgb.shape[:2]
        mask = _mask_to_binary(mask_raw, h, w)

        # Slight expansion helps remove watermark halos/antialiasing.
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.dilate(mask, k, iterations=1)

        rgb_pad, mask_pad, (oh, ow) = _pad_for_model(rgb, mask, mult=8)
        repaired_pad = _run_lama(rgb_pad, mask_pad)
        repaired = repaired_pad[:oh, :ow]
        repaired = _texture_tone_match(rgb, repaired, mask)

        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(repaired, mode="RGB").save(str(output_path), format="PNG", compress_level=2, optimize=True)
        return True
    except Exception:
        return False


def remove_watermark_with_rect(
    image_path: str | Path,
    output_path: str | Path,
    x: int,
    y: int,
    width: int,
    height: int,
) -> bool:
    """
    Rectangle-input variant (CLI-friendly) when mask file is not provided.
    """
    try:
        rgb = _read_rgb(image_path)
        h, w = rgb.shape[:2]
        x1 = max(0, min(w - 1, int(x)))
        y1 = max(0, min(h - 1, int(y)))
        x2 = max(x1 + 1, min(w, x1 + int(width)))
        y2 = max(y1 + 1, min(h, y1 + int(height)))
        mask = np.zeros((h, w), dtype=np.uint8)
        mask[y1:y2, x1:x2] = 255

        rgb_pad, mask_pad, (oh, ow) = _pad_for_model(rgb, mask, mult=8)
        repaired_pad = _run_lama(rgb_pad, mask_pad)
        repaired = repaired_pad[:oh, :ow]
        repaired = _texture_tone_match(rgb, repaired, mask)

        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(repaired, mode="RGB").save(str(output_path), format="PNG", compress_level=2, optimize=True)
        return True
    except Exception:
        return False


def remove_watermark_bytes(raw_image: bytes, raw_mask: bytes) -> bytes:
    """
    In-memory API variant.
    Returns PNG bytes on success, raises on failure so caller can fallback gracefully.
    """
    arr = np.frombuffer(raw_image, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Could not decode image bytes.")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    h, w = rgb.shape[:2]

    mask_arr = np.frombuffer(raw_mask, dtype=np.uint8)
    mask_dec = cv2.imdecode(mask_arr, cv2.IMREAD_GRAYSCALE)
    if mask_dec is None:
        raise ValueError("Could not decode mask bytes.")
    mask = _mask_to_binary(mask_dec, h, w)
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=1)

    rgb_pad, mask_pad, (oh, ow) = _pad_for_model(rgb, mask, mult=8)
    repaired_pad = _run_lama(rgb_pad, mask_pad)
    repaired = repaired_pad[:oh, :ow]
    repaired = _texture_tone_match(rgb, repaired, mask)

    out = io.BytesIO()
    Image.fromarray(repaired, mode="RGB").save(out, format="PNG", compress_level=2, optimize=True)
    return out.getvalue()


def select_mask_rectangle(image_path: str | Path) -> Optional[np.ndarray]:
    """
    Optional rectangle selector for local desktop usage.
    Returns a binary mask (white=selected) or None if cancelled.
    """
    image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
    if image is None:
        return None
    roi = cv2.selectROI("Select watermark area", image, fromCenter=False, showCrosshair=True)
    cv2.destroyWindow("Select watermark area")
    x, y, w, h = roi
    if w <= 0 or h <= 0:
        return None
    mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)
    mask[y : y + h, x : x + w] = 255
    return mask
