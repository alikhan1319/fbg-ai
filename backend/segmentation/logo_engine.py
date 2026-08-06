"""
Advanced logo / signature / small-graphic cutout.

Neural rembg models often erase logos (or keep only white blobs).
This engine uses multi-strategy classical segmentation and picks the
best mask that preserves ink, text, and brand marks.
"""
from __future__ import annotations

import logging
from collections import deque

import cv2
import numpy as np

logger = logging.getLogger("fbr-ai.seg.logo")


def looks_like_logo_or_mark(rgb: np.ndarray) -> bool:
    """Heuristic for logos, icons, stamps, signatures, small graphics."""
    h, w = rgb.shape[:2]
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)

    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]], axis=0)
    border_bright = float(np.mean(border.mean(axis=1) >= 220))
    border_dark = float(np.mean(border.mean(axis=1) <= 45))
    bright = float(np.mean(gray > 200))
    dark = float(np.mean(gray < 50))
    mid = float(np.mean((gray > 50) & (gray < 200)))
    sat = float(np.mean(hsv[:, :, 1] > 40))
    edges = cv2.Canny(gray, 60, 140)
    edge_ratio = float(np.mean(edges > 0))
    area = h * w

    if area <= 1_200_000 and border_bright > 0.4 and mid < 0.55 and edge_ratio >= 0.002:
        return True
    if area <= 1_200_000 and border_dark > 0.4 and mid < 0.55:
        return True
    if border_bright > 0.55 and bright > 0.35 and mid < 0.48 and dark < 0.4:
        return True
    if sat > 0.06 and mid < 0.5 and edge_ratio > 0.01 and area <= 1_400_000:
        if border_bright > 0.3 or border_dark > 0.3:
            return True
    return False


def _border_bg_stats(rgb: np.ndarray) -> tuple[np.ndarray, float]:
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]], axis=0).astype(np.float32)
    mean = border.mean(axis=0)
    # Robust: median reduces outlier influence from logo touching edges
    med = np.median(border, axis=0)
    chroma = float(np.mean(np.linalg.norm(border - med, axis=1)))
    return med.astype(np.float32), chroma


def _flood_bg_mask(is_bg: np.ndarray) -> np.ndarray:
    h, w = is_bg.shape
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
        if visited[y, x] or not is_bg[y, x]:
            continue
        visited[y, x] = True
        q.append((y - 1, x))
        q.append((y + 1, x))
        q.append((y, x - 1))
        q.append((y, x + 1))
    return visited


def _score_alpha(alpha: np.ndarray, rgb: np.ndarray) -> float:
    a = alpha.astype(np.float32)
    fg_pixels = int(np.count_nonzero(a > 20))
    fg = fg_pixels / float(a.size)
    if fg_pixels < 8 or fg > 0.92:
        return -1.0
    # Prefer keeping saturated / dark / edged ink
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    ink = (gray < 210) | (hsv[:, :, 1] > 35)
    ink_keep = float(np.mean(ink & (a > 20))) / max(float(np.mean(ink)), 1e-6)
    edges = cv2.Canny(gray.astype(np.uint8), 60, 140) > 0
    edge_keep = float(np.mean(edges & (a > 20))) / max(float(np.mean(edges)), 1e-6)
    score = ink_keep * 0.55 + edge_keep * 0.35 + min(fg, 0.4) * 0.25
    if 0.0005 <= fg <= 0.75:
        score += 0.08
    return score


def _alpha_from_bg(bg_mask: np.ndarray, soft: float = 0.7) -> np.ndarray:
    alpha = np.where(bg_mask, 0.0, 255.0).astype(np.float32)
    if soft > 0:
        alpha = cv2.GaussianBlur(alpha, (0, 0), sigmaX=soft, sigmaY=soft)
    return np.clip(alpha, 0, 255).astype(np.uint8)


def _strategy_flat_border_flood(rgb: np.ndarray) -> np.ndarray | None:
    """Remove background matching border color, connected to edges."""
    bg_col, chroma = _border_bg_stats(rgb)
    # Adaptive distance: tighter for flat white, looser for soft paper
    base = 28.0 + min(chroma * 0.35, 40.0)
    dist = np.linalg.norm(rgb.astype(np.float32) - bg_col, axis=2)
    is_bg = dist <= base
    # Also treat near-white as BG when border is bright
    if float(np.mean(bg_col)) >= 210:
        min_c = rgb.min(axis=2)
        max_c = rgb.max(axis=2)
        is_bg |= (rgb[:, :, 0] >= 232) & (rgb[:, :, 1] >= 232) & (rgb[:, :, 2] >= 232) & ((max_c - min_c) <= 28)
    if float(np.mean(bg_col)) <= 45:
        is_bg |= rgb.mean(axis=2) <= 35

    bg = _flood_bg_mask(is_bg)
    fg_pixels = int(np.count_nonzero(~bg))
    fg = fg_pixels / float(rgb.shape[0] * rgb.shape[1])
    if fg_pixels < 8 or fg > 0.95:
        return None
    return _alpha_from_bg(bg, soft=0.55)


def _strategy_ink_threshold(rgb: np.ndarray) -> np.ndarray | None:
    """Keep dark / saturated ink; drop flat field."""
    bg_col, _ = _border_bg_stats(rgb)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    dist = np.linalg.norm(rgb.astype(np.float32) - bg_col, axis=2)

    if float(np.mean(bg_col)) >= 180:
        # Light paper: keep darker or colorful pixels
        ink = (gray < 210) | (hsv[:, :, 1] > 25) | (dist > 22)
    elif float(np.mean(bg_col)) <= 60:
        # Dark canvas: keep brighter, colorful, or different-from-border pixels
        ink = (gray > 40) | (hsv[:, :, 1] > 25) | (dist > 22)
    else:
        ink = (dist > 24) | (hsv[:, :, 1] > 30)

    ink_u8 = ink.astype(np.uint8) * 255
    # Close small gaps in letterforms; open speckles
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    ink_u8 = cv2.morphologyEx(ink_u8, cv2.MORPH_CLOSE, k, iterations=1)
    ink_u8 = cv2.morphologyEx(ink_u8, cv2.MORPH_OPEN, k, iterations=1)

    # Drop tiny islands, keep all meaningful mark components
    num, labels, stats, _ = cv2.connectedComponentsWithStats((ink_u8 > 0).astype(np.uint8), 8)
    if num <= 1:
        return None
    area = float(rgb.shape[0] * rgb.shape[1])
    min_area = max(2, int(0.00002 * area))
    keep = np.zeros_like(ink_u8)
    kept = 0
    for i in range(1, num):
        if int(stats[i, cv2.CC_STAT_AREA]) >= min_area:
            keep[labels == i] = 255
            kept += 1
    if kept == 0:
        # Keep raw ink if components were all tiny (dot logos / thin strokes)
        keep = ink_u8
    fg_pixels = int(np.count_nonzero(keep > 0))
    fg = fg_pixels / area
    if fg_pixels < 8 or fg > 0.95:
        return None
    alpha = keep.astype(np.float32)
    alpha = cv2.GaussianBlur(alpha, (0, 0), sigmaX=0.45, sigmaY=0.45)
    return np.clip(alpha, 0, 255).astype(np.uint8)


def _strategy_grabcut_box(rgb: np.ndarray) -> np.ndarray | None:
    """Loose center-box GrabCut for marks that don't touch a flat border."""
    h, w = rgb.shape[:2]
    if h * w > 1_000_000:
        return None
    margin_x, margin_y = int(0.04 * w), int(0.04 * h)
    rect = (margin_x, margin_y, max(1, w - 2 * margin_x), max(1, h - 2 * margin_y))
    gc = np.zeros((h, w), np.uint8)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    try:
        cv2.grabCut(rgb, gc, rect, bgd, fgd, 3, cv2.GC_INIT_WITH_RECT)
    except Exception:
        return None
    mask = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    fg = float(np.mean(mask > 0))
    if fg < 0.004 or fg > 0.90:
        return None
    return mask


def force_logo_alpha(rgb: np.ndarray) -> np.ndarray:
    """Always return some mark mask — used when rembg must not run."""
    for fn in (_strategy_ink_threshold, _strategy_flat_border_flood):
        try:
            alpha = fn(rgb)
        except Exception:
            alpha = None
        if alpha is not None and int(np.count_nonzero(alpha > 12)) >= 8:
            return alpha

    bg_col, _ = _border_bg_stats(rgb)
    dist = np.linalg.norm(rgb.astype(np.float32) - bg_col, axis=2)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    if float(np.mean(bg_col)) >= 180:
        ink = (gray < 245) | (hsv[:, :, 1] > 18) | (dist > 12)
    elif float(np.mean(bg_col)) <= 60:
        ink = (gray > 25) | (hsv[:, :, 1] > 18) | (dist > 12)
    else:
        ink = dist > 14
    alpha = (ink.astype(np.uint8) * 255)
    if int(np.count_nonzero(alpha)) < 8:
        # Extremely sparse mark: keep non-exact border color pixels
        alpha = (dist > 6).astype(np.uint8) * 255
    return alpha


def cutout_logo_alpha(rgb: np.ndarray, image_type: str = "logo") -> np.ndarray | None:
    """
    Return best uint8 alpha for a logo/signature/small graphic, or None if unsure.
    """
    strategies = [
        ("border-flood", _strategy_flat_border_flood),
        ("ink-threshold", _strategy_ink_threshold),
    ]
    # GrabCut only as last resort for complex color logos
    if image_type in {"logo", "graphic", "general", "product"}:
        strategies.append(("grabcut", _strategy_grabcut_box))

    best_alpha: np.ndarray | None = None
    best_score = -1.0
    best_name = ""
    for name, fn in strategies:
        try:
            alpha = fn(rgb)
        except Exception as exc:
            logger.debug("logo strategy %s failed: %s", name, exc)
            continue
        if alpha is None:
            continue
        score = _score_alpha(alpha, rgb)
        logger.debug("logo strategy %s score=%.3f fg=%.4f", name, score, float(np.mean(alpha > 20)))
        if score > best_score:
            best_score = score
            best_alpha = alpha
            best_name = name

    # Always keep a usable mark mask for logo/signature — never return empty to rembg
    if best_alpha is None or best_score < 0.12:
        forced = _strategy_ink_threshold(rgb)
        if forced is None:
            forced = _strategy_flat_border_flood(rgb)
        if forced is not None and float(np.mean(forced > 20)) >= 0.002:
            logger.info("logo engine: forced fallback (best was %.3f)", best_score)
            return forced
        logger.info("logo engine: no confident mask (best=%.3f)", best_score)
        return None

    logger.info("logo engine: using %s (score=%.3f)", best_name, best_score)
    return best_alpha
