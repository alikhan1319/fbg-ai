"""
Dedicated signature cutout — clears paper fully, keeps pen ink.

Restores the old connected-paper flood behavior (what worked before),
plus cream/shadow/lined-paper handling. Logo engine is untouched.
"""
from __future__ import annotations

import logging
from collections import deque

import cv2
import numpy as np

logger = logging.getLogger("fbr-ai.seg.signature")


def _border_paper_color(rgb: np.ndarray) -> np.ndarray:
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]], axis=0).astype(np.float32)
    luma = border.mean(axis=1)
    bright = border[luma >= np.percentile(luma, 40)]
    if len(bright) < 8:
        bright = border
    return np.median(bright, axis=0).astype(np.float32)


def _flood_from_borders(is_bg: np.ndarray) -> np.ndarray:
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


def _paper_like_mask(rgb: np.ndarray) -> np.ndarray:
    """True where pixel looks like paper (white / cream / light gray), not ink."""
    paper = _border_paper_color(rgb)
    rgb_f = rgb.astype(np.float32)
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    dist = np.linalg.norm(rgb_f - paper, axis=2)
    paper_l = float(np.mean(paper))

    # Generous paper band — old system used ~240 white; extend for cream photos
    near_paper = dist <= (38.0 if paper_l >= 200 else 32.0)
    bright_flat = (gray >= max(200.0, paper_l - 25.0)) & (hsv[:, :, 1] < 45)
    near_white = (rgb[:, :, 0] >= 228) & (rgb[:, :, 1] >= 228) & (rgb[:, :, 2] >= 228)
    near_white &= (rgb.max(axis=2) - rgb.min(axis=2)) <= 30

    # Not ink: reject clearly darker / saturated pen
    darker = gray < (paper_l - 22)
    blue_pen = (hsv[:, :, 1] > 40) & (hsv[:, :, 2] < 210) & (gray < paper_l - 8)
    ink = darker | blue_pen

    return (near_paper | bright_flat | near_white) & ~ink


def _strip_ruled_lines(ink_u8: np.ndarray, gray: np.ndarray) -> np.ndarray:
    """Remove long horizontal notebook lines from an ink mask."""
    h, w = ink_u8.shape
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (max(20, w // 16), 1))
    lines = cv2.morphologyEx(ink_u8, cv2.MORPH_OPEN, h_kernel, iterations=1)
    # Only strip lines that are light blue/gray (ruled), not dark pen strokes
    line_px = lines > 0
    if not np.any(line_px):
        return ink_u8
    line_luma = float(np.mean(gray[line_px])) if np.any(line_px) else 0
    if line_luma > 140:  # pale ruled lines
        return cv2.subtract(ink_u8, lines)
    return ink_u8


def _finalize_signature_alpha(rgb: np.ndarray, ink_mask: np.ndarray) -> np.ndarray:
    """
    Hard-clear paper (alpha=0), keep ink opaque, tiny soft fringe on stroke edges.
    This matches the old connected-white behavior users preferred.
    """
    paper = _paper_like_mask(rgb)
    bg = _flood_from_borders(paper)

    alpha = np.zeros(ink_mask.shape, dtype=np.float32)
    alpha[ink_mask > 0] = 255.0

    # Anything flooded as paper is fully transparent — even if weakly ink-marked
    alpha[bg] = 0.0

    # Also clear remaining paper-like pixels that aren't strong ink
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    paper_col = _border_paper_color(rgb)
    paper_l = float(np.mean(paper_col))
    weak = (alpha > 0) & (gray >= paper_l - 12) & (ink_mask < 200)
    alpha[weak] = 0.0

    # Soften only the ink boundary (1px feel), then hard-kill fog
    alpha = cv2.GaussianBlur(alpha, (0, 0), sigmaX=0.55, sigmaY=0.55)
    alpha[alpha < 28] = 0.0
    alpha[alpha > 200] = 255.0
    return np.clip(alpha, 0, 255).astype(np.uint8)


def _strategy_connected_paper_flood(rgb: np.ndarray) -> np.ndarray | None:
    """
    Primary — same idea as the old white-bg BFS that worked well for signatures.
    """
    paper = _paper_like_mask(rgb)
    bg = _flood_from_borders(paper)
    total = rgb.shape[0] * rgb.shape[1]
    fg_ratio = 1.0 - float(np.count_nonzero(bg)) / float(total)
    # Reject if almost nothing left or almost everything kept
    if fg_ratio < 0.0003 or fg_ratio > 0.55:
        return None

    ink = (~bg).astype(np.uint8) * 255
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    ink = _strip_ruled_lines(ink, gray)

    # Drop speckles; keep stroke components
    num, labels, stats, _ = cv2.connectedComponentsWithStats((ink > 0).astype(np.uint8), 8)
    if num > 1:
        min_area = max(3, int(0.00002 * total))
        keep = np.zeros_like(ink)
        for i in range(1, num):
            if int(stats[i, cv2.CC_STAT_AREA]) >= min_area:
                keep[labels == i] = 255
        if int(np.count_nonzero(keep)) >= 8:
            ink = keep

    return _finalize_signature_alpha(rgb, ink)


def _strategy_ink_on_paper(rgb: np.ndarray) -> np.ndarray | None:
    """Ink = darker / blue pen; then hard-clear paper flood."""
    paper_col = _border_paper_color(rgb)
    paper_l = float(np.mean(paper_col))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    dist = np.linalg.norm(rgb.astype(np.float32) - paper_col, axis=2)

    ink = (gray < paper_l - 16) | (dist > 28)
    blue = (hsv[:, :, 1] > 35) & (gray < paper_l - 6) & (hsv[:, :, 2] < 220)
    ink |= blue

    ink_u8 = ink.astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    ink_u8 = cv2.morphologyEx(ink_u8, cv2.MORPH_OPEN, k, iterations=1)
    ink_u8 = _strip_ruled_lines(ink_u8, gray.astype(np.uint8))

    fg = float(np.mean(ink_u8 > 0))
    if fg < 0.0003 or fg > 0.45:
        return None
    return _finalize_signature_alpha(rgb, ink_u8)


def _strategy_adaptive_ink(rgb: np.ndarray) -> np.ndarray | None:
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    block = max(15, (min(gray.shape) // 18) | 1)
    if block % 2 == 0:
        block += 1
    local = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, block, 10
    )
    local = _strip_ruled_lines(local, gray)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    local = cv2.morphologyEx(local, cv2.MORPH_OPEN, k, iterations=1)
    fg = float(np.mean(local > 0))
    if fg < 0.0003 or fg > 0.45:
        return None
    return _finalize_signature_alpha(rgb, local)


def _score_signature(alpha: np.ndarray, rgb: np.ndarray) -> float:
    a = alpha.astype(np.float32)
    fg_px = int(np.count_nonzero(a > 20))
    fg = fg_px / float(a.size)
    if fg_px < 8 or fg > 0.50:
        return -1.0
    # Reward fully cleared paper
    clear = float(np.mean(a == 0))
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    paper = float(np.mean(gray[a == 0])) if np.any(a == 0) else float(np.mean(gray))
    ink_l = float(np.mean(gray[a > 40])) if np.any(a > 40) else paper
    contrast = (paper - ink_l) / max(paper, 1.0)
    score = clear * 0.35 + contrast * 0.45 + min(fg, 0.15) * 1.5
    if clear >= 0.85:
        score += 0.2
    return score


def cutout_signature_alpha(rgb: np.ndarray) -> np.ndarray | None:
    strategies = (
        ("connected-paper", _strategy_connected_paper_flood),
        ("ink-on-paper", _strategy_ink_on_paper),
        ("adaptive-ink", _strategy_adaptive_ink),
    )
    best_a: np.ndarray | None = None
    best_s = -1.0
    best_n = ""
    for name, fn in strategies:
        try:
            alpha = fn(rgb)
        except Exception as exc:
            logger.debug("signature strategy %s failed: %s", name, exc)
            continue
        if alpha is None:
            continue
        score = _score_signature(alpha, rgb)
        if score > best_s:
            best_s, best_a, best_n = score, alpha, name

    if best_a is not None and best_s >= 0.05:
        logger.info("signature engine: using %s (score=%.3f)", best_n, best_s)
        return best_a

    for fn in (_strategy_connected_paper_flood, _strategy_ink_on_paper, _strategy_adaptive_ink):
        forced = fn(rgb)
        if forced is not None and int(np.count_nonzero(forced > 20)) >= 8:
            logger.info("signature engine: forced fallback")
            return forced
    logger.info("signature engine: no confident mask (best=%.3f)", best_s)
    return None


def force_signature_alpha(rgb: np.ndarray) -> np.ndarray:
    """Always clear paper — never leave background standing."""
    alpha = cutout_signature_alpha(rgb)
    if alpha is not None and int(np.count_nonzero(alpha > 20)) >= 8:
        return alpha

    # Last resort: flood all paper-like pixels from borders
    paper = _paper_like_mask(rgb)
    # Widen paper band
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    paper |= gray >= 210
    bg = _flood_from_borders(paper)
    ink = (~bg).astype(np.uint8) * 255
    return _finalize_signature_alpha(rgb, ink)
