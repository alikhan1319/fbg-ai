"""PyMatting refine for hair, lace, fabric, semi-transparent objects."""

from __future__ import annotations

import logging
import os

import cv2
import numpy as np

logger = logging.getLogger("fbr-ai.seg.matting")


def _build_trimap(alpha: np.ndarray, image_type: str) -> np.ndarray:
    """
    0 = definite BG, 255 = definite FG, 128 = unknown.
    Wider unknown band for hair / fabric / portraits.
    """
    a = alpha.astype(np.uint8)
    if image_type in {"human", "passport"}:
        fg_t, bg_t, erode = 245, 15, 12
    elif image_type in {"vehicle", "product", "graphic"}:
        fg_t, bg_t, erode = 240, 20, 8
    elif image_type in {"signature", "logo"}:
        fg_t, bg_t, erode = 230, 25, 4
    else:
        fg_t, bg_t, erode = 240, 18, 10

    # Env overrides
    fg_t = int(os.getenv("MATTING_FG", str(fg_t)))
    bg_t = int(os.getenv("MATTING_BG", str(bg_t)))
    erode = int(os.getenv("MATTING_ERODE", str(erode)))
    erode = max(1, min(erode, 40))

    trimap = np.full(a.shape, 128, dtype=np.uint8)
    trimap[a >= fg_t] = 255
    trimap[a <= bg_t] = 0

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (erode, erode))
    # Expand unknown band around FG/BG boundary
    fg = (trimap == 255).astype(np.uint8)
    bg = (trimap == 0).astype(np.uint8)
    fg_er = cv2.erode(fg, kernel, iterations=1)
    bg_er = cv2.erode(bg, kernel, iterations=1)
    out = np.full(a.shape, 128, dtype=np.uint8)
    out[fg_er > 0] = 255
    out[bg_er > 0] = 0
    return out


def refine_alpha_matting(
    rgb: np.ndarray,
    alpha: np.ndarray,
    image_type: str = "general",
) -> np.ndarray:
    """
    Return refined uint8 alpha. On failure, returns original alpha.
    Optimized for hair, lace, embroidery, transparent fabric.
    """
    disable = os.getenv("SEG_DISABLE_MATTING", "auto").strip().lower()
    if disable in {"1", "true", "yes", "on"}:
        return alpha
    if disable in {"auto", ""}:
        # PyMatting on CPU often takes 1–3+ minutes and leaves the UI stuck at Finishing.
        try:
            from .device import resolve_device

            if resolve_device() == "cpu":
                return alpha
        except Exception:
            return alpha

    max_edge = int(os.getenv("MATTING_MAX_EDGE", "1280"))
    h, w = alpha.shape
    scale = 1.0
    work_rgb, work_a = rgb, alpha
    if max(h, w) > max_edge:
        scale = max_edge / float(max(h, w))
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        work_rgb = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_AREA)
        work_a = cv2.resize(alpha, (nw, nh), interpolation=cv2.INTER_LINEAR)

    trimap = _build_trimap(work_a, image_type)
    # Need both FG and BG seeds
    if not np.any(trimap == 255) or not np.any(trimap == 0):
        logger.info("Matting skipped — empty FG/BG seeds")
        return alpha

    try:
        from pymatting import estimate_alpha_cf

        img = work_rgb.astype(np.float64) / 255.0
        tri = np.zeros(work_a.shape, dtype=np.float64)
        tri[trimap == 255] = 1.0
        tri[trimap == 128] = 0.5
        tri[trimap == 0] = 0.0
        alpha_f = estimate_alpha_cf(img, tri)
        alpha_u8 = np.clip(alpha_f * 255.0, 0, 255).astype(np.uint8)
        if scale < 1.0:
            alpha_u8 = cv2.resize(alpha_u8, (w, h), interpolation=cv2.INTER_LINEAR)
        # Preserve solid cores from BiRefNet
        solid = alpha >= 250
        alpha_u8 = np.where(solid, alpha, alpha_u8)
        return alpha_u8
    except Exception as exc:
        logger.warning("PyMatting failed (%s) — keeping BiRefNet alpha", exc)
        return alpha
