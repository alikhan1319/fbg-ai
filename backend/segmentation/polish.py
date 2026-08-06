"""Type-aware cutout polish — clear leftover BG so only the subject remains."""
from __future__ import annotations

from collections import deque

import cv2
import numpy as np


def _estimate_bg_color(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    a = alpha.astype(np.float32) / 255.0
    near_bg = a < 0.12
    border = np.zeros_like(near_bg)
    border[0, :] = True
    border[-1, :] = True
    border[:, 0] = True
    border[:, -1] = True
    sample = near_bg | (border & (a < 0.55))
    if np.count_nonzero(sample) > 64:
        return rgb[sample].mean(axis=0).astype(np.float32)
    return np.array([255.0, 255.0, 255.0], dtype=np.float32)


def _guided_filter_alpha(alpha: np.ndarray, guide_rgb: np.ndarray, radius: int = 4, eps: float = 1e-3) -> np.ndarray:
    I = cv2.cvtColor(guide_rgb, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    p = alpha.astype(np.float32) / 255.0
    k = 2 * max(1, radius) + 1
    mean_I = cv2.boxFilter(I, cv2.CV_32F, (k, k))
    mean_p = cv2.boxFilter(p, cv2.CV_32F, (k, k))
    mean_Ip = cv2.boxFilter(I * p, cv2.CV_32F, (k, k))
    cov_Ip = mean_Ip - mean_I * mean_p
    mean_II = cv2.boxFilter(I * I, cv2.CV_32F, (k, k))
    var_I = mean_II - mean_I * mean_I
    a = cov_Ip / (var_I + eps)
    b = mean_p - a * mean_I
    mean_a = cv2.boxFilter(a, cv2.CV_32F, (k, k))
    mean_b = cv2.boxFilter(b, cv2.CV_32F, (k, k))
    q = mean_a * I + mean_b
    return np.clip(q * 255.0, 0.0, 255.0)


def _lock_subject_soft(alpha: np.ndarray) -> np.ndarray:
    a = alpha.astype(np.uint8)
    binary = (a > 20).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num <= 1:
        return a
    img_area = float(a.size)
    # Very small speckles only — keep tiny logo strokes / dots
    min_area = max(4, int(0.00015 * img_area))
    out = a.copy()
    for i in range(1, num):
        if int(stats[i, cv2.CC_STAT_AREA]) < min_area:
            out[labels == i] = 0
    return out


def _lock_subject_components(alpha: np.ndarray) -> np.ndarray:
    a = alpha.astype(np.uint8)
    h_img, w_img = a.shape
    img_area = float(a.size)

    binary = (a > 40).astype(np.uint8)
    open_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, open_k, iterations=1)

    num, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num <= 1:
        return a

    candidates: list[tuple[float, int]] = []
    for i in range(1, num):
        x, y, bw, bh, area = stats[i]
        if area < max(64, int(0.0015 * img_area)):
            continue
        aspect_h = bh / max(float(bw), 1.0)
        aspect_w = bw / max(float(bh), 1.0)
        if aspect_h >= 2.8 and bw < 0.12 * w_img:
            continue
        if aspect_h >= 4.0:
            continue
        if area < 0.01 * img_area and aspect_h > 2.0:
            continue

        cy = float(centroids[i][1]) / float(h_img)
        cx = float(centroids[i][0]) / float(w_img)
        score = float(area)
        score *= 0.45 + 0.55 * cy
        score *= 0.75 + 0.25 * (1.0 - abs(cx - 0.5) * 2.0)
        score *= 0.65 + 0.35 * min(1.5, aspect_w)
        candidates.append((score, i))

    if not candidates:
        areas = stats[1:, cv2.CC_STAT_AREA]
        keep_ids = [1 + int(np.argmax(areas))]
    else:
        candidates.sort(reverse=True)
        primary = candidates[0][1]
        keep_ids = [primary]
        px, py, pw, ph, _ = stats[primary]
        primary_area = float(stats[primary, cv2.CC_STAT_AREA])
        for _score, i in candidates[1:]:
            if float(stats[i, cv2.CC_STAT_AREA]) < 0.08 * primary_area:
                continue
            x, y, bw, bh, _ = stats[i]
            pad = int(0.06 * max(h_img, w_img))
            if x + bw < px - pad or x > px + pw + pad or y + bh < py - pad or y > py + ph + pad:
                continue
            keep_ids.append(i)

    keep = np.zeros_like(binary)
    for i in keep_ids:
        keep[labels == i] = 1

    rad = max(2, int(round(0.003 * max(h_img, w_img))))
    rad = min(rad, 10)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * rad + 1, 2 * rad + 1))
    keep_soft = cv2.dilate(keep, kernel, iterations=1)

    out = a.astype(np.float32)
    out[keep_soft == 0] = 0
    _, py, _, _, _ = stats[keep_ids[0]]
    wipe_y = max(0, int(py - 0.015 * h_img))
    if wipe_y > 4:
        band = out[:wipe_y, :]
        band_keep = keep_soft[:wipe_y, :]
        band[band_keep == 0] = 0
        out[:wipe_y, :] = band
    return np.clip(out, 0, 255).astype(np.uint8)


def _strip_thin_artifacts(alpha: np.ndarray) -> np.ndarray:
    a = alpha.astype(np.uint8)
    binary = (a > 30).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if num <= 1:
        return a
    h_img, w_img = a.shape
    out = a.copy()
    main_area = int(stats[1:, cv2.CC_STAT_AREA].max()) if num > 1 else 0
    for i in range(1, num):
        _x, _y, bw, bh, area = stats[i]
        aspect = bh / max(float(bw), 1.0)
        if area < 0.25 * main_area and aspect >= 2.4 and bw < 0.1 * w_img:
            out[labels == i] = 0
        elif area < 0.04 * main_area and aspect >= 1.8:
            out[labels == i] = 0
    return out


def _keep_thick_subject(alpha: np.ndarray, aggressive: bool = False) -> np.ndarray:
    a = alpha.astype(np.uint8)
    binary = (a > 36).astype(np.uint8)
    if int(binary.sum()) < 64:
        return a

    dist = cv2.distanceTransform(binary, cv2.DIST_L2, 5)
    thr = max(4.0, (0.016 if aggressive else 0.011) * float(max(a.shape)))
    core = (dist >= thr).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
    if num <= 1:
        thr = max(3.0, thr * 0.7)
        core = (dist >= thr).astype(np.uint8)
        num, labels, stats, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
        if num <= 1:
            return a

    areas = stats[1:, cv2.CC_STAT_AREA]
    primary = 1 + int(np.argmax(areas))
    core_keep = (labels == primary).astype(np.uint8)

    grow = max(4, int(round(thr)) + 2)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * grow + 1, 2 * grow + 1))
    soft = cv2.dilate(core_keep, k, iterations=1) & binary
    step = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    for _ in range(10 if not aggressive else 6):
        nxt = cv2.dilate(soft, step, iterations=1) & binary
        if np.array_equal(nxt, soft):
            break
        soft = nxt

    out = a.astype(np.float32)
    out[soft == 0] = 0
    return np.clip(out, 0, 255).astype(np.uint8)


def _clear_corner_background(alpha: np.ndarray, rgb: np.ndarray) -> np.ndarray:
    """Wipe leftover BG connected to image borders — never eat solid subject cores."""
    h, w = alpha.shape
    a = alpha.astype(np.float32)
    rgb_f = rgb.astype(np.float32)
    bg = _estimate_bg_color(rgb_f, alpha)
    color_dist = np.linalg.norm(rgb_f - bg, axis=2)

    # Mild thresholds — aggressive ones carved hair / limbs / product edges
    likely_bg = (a < 110) | ((a < 200) & (color_dist < 48))
    likely_bg &= a < 230

    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        if likely_bg[0, x]:
            q.append((0, x))
        if likely_bg[h - 1, x]:
            q.append((h - 1, x))
    for y in range(h):
        if likely_bg[y, 0]:
            q.append((y, 0))
        if likely_bg[y, w - 1]:
            q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        if y < 0 or y >= h or x < 0 or x >= w:
            continue
        if visited[y, x] or not likely_bg[y, x]:
            continue
        visited[y, x] = True
        q.append((y - 1, x))
        q.append((y + 1, x))
        q.append((y, x - 1))
        q.append((y, x + 1))

    out = a.copy()
    out[visited] = 0

    band = max(2, int(0.01 * max(h, w)))
    border = np.zeros((h, w), dtype=bool)
    border[:band, :] = True
    border[-band:, :] = True
    border[:, :band] = True
    border[:, -band:] = True
    corner_mess = border & (out < 180) & (color_dist < 55)
    out[corner_mess] = 0
    return np.clip(out, 0, 255).astype(np.uint8)


def _soften_fog(alpha: np.ndarray, fog_cut: float = 0.04, firm: float = 0.45) -> np.ndarray:
    """Gently clear weak fog without binary-crushing soft subject edges."""
    a01 = np.clip(alpha.astype(np.float32) / 255.0, 0.0, 1.0)
    fringe = (a01 > fog_cut) & (a01 < 0.98)
    curved = a01 * a01 * (3.0 - 2.0 * a01)
    a01 = np.where(fringe, (1.0 - firm) * a01 + firm * curved, a01)
    a01 = np.where(a01 < fog_cut, 0.0, a01)
    a01 = np.where(a01 > 0.98, 1.0, a01)
    return (a01 * 255.0).astype(np.uint8)


def refine_cutout_rgba(rgb: np.ndarray, alpha: np.ndarray, image_type: str = "general") -> tuple[np.ndarray, np.ndarray]:
    """
    Balanced polish: clear leftover BG, preserve important subject parts
    (hair, limbs, product edges, thin details).
    """
    alpha_u8 = alpha.astype(np.uint8)
    rgb_u8 = rgb.astype(np.uint8)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha_u8 = cv2.morphologyEx(alpha_u8, cv2.MORPH_CLOSE, kernel, iterations=1)

    if image_type in {"human", "passport"}:
        # Preserve hair / soft edges — light cleanup only
        alpha_u8 = _lock_subject_soft(alpha_u8)
        alpha_u8 = _clear_corner_background(alpha_u8, rgb_u8)
        guide_r, guide_eps = 5, 5e-4
        fog_cut, firm, decontam = 0.03, 0.35, 1.15
    elif image_type == "signature":
        # Hard-clear leftover paper fog; keep pen strokes
        alpha_u8 = _lock_subject_soft(alpha_u8)
        # Zero weak paper residue that still looks like background
        gray = cv2.cvtColor(rgb_u8, cv2.COLOR_RGB2GRAY)
        weak_paper = (alpha_u8 > 0) & (alpha_u8 < 90) & (gray > 200)
        alpha_u8 = alpha_u8.copy()
        alpha_u8[weak_paper] = 0
        guide_r, guide_eps = 1, 3e-3
        fog_cut, firm, decontam = 0.06, 0.55, 1.0
    elif image_type == "logo":
        # Never carve letterforms / color marks — speckles only, no border flood
        alpha_u8 = _lock_subject_soft(alpha_u8)
        guide_r, guide_eps = 2, 2e-3
        fog_cut, firm, decontam = 0.02, 0.25, 1.05
    elif image_type in {"vehicle", "graphic"}:
        # Poster/text leftovers only — mild thick core
        alpha_u8 = _keep_thick_subject(alpha_u8, aggressive=False)
        alpha_u8 = _lock_subject_components(alpha_u8)
        alpha_u8 = _strip_thin_artifacts(alpha_u8)
        alpha_u8 = _clear_corner_background(alpha_u8, rgb_u8)
        guide_r, guide_eps = 4, 8e-4
        fog_cut, firm, decontam = 0.04, 0.50, 1.35
    else:
        # product / general — keep subject intact, drop speckles + border fog
        alpha_u8 = _lock_subject_soft(alpha_u8)
        alpha_u8 = _clear_corner_background(alpha_u8, rgb_u8)
        guide_r, guide_eps = 4, 8e-4
        fog_cut, firm, decontam = 0.04, 0.45, 1.30

    guided = _guided_filter_alpha(alpha_u8, rgb_u8, radius=guide_r, eps=guide_eps)
    solid = (alpha_u8 >= 245) | (alpha_u8 <= 6)
    alpha_u8 = np.where(solid, alpha_u8, guided.astype(np.uint8)).astype(np.uint8)
    alpha_u8 = _soften_fog(alpha_u8, fog_cut=fog_cut, firm=firm)

    a01 = alpha_u8.astype(np.float32) / 255.0
    rgb_f = rgb_u8.astype(np.float32)
    bg = _estimate_bg_color(rgb_f, alpha_u8)
    fringe = (a01 > 0.03) & (a01 < 0.96)
    if np.any(fringe):
        clean = (rgb_f - bg * (1.0 - a01)[..., None]) / np.maximum(a01[..., None], 0.05)
        clean = np.clip(clean, 0.0, 255.0)
        mix = np.clip((1.0 - a01) * decontam, 0.15, 0.90)
        rgb_f = np.where(fringe[..., None], rgb_f * (1.0 - mix[..., None]) + clean * mix[..., None], rgb_f)

    out_rgb = np.clip(rgb_f, 0, 255).astype(np.uint8)
    out_a = alpha_u8
    out_rgb[out_a == 0] = 0
    return out_rgb, out_a


def background_sheet(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Fill subject with estimated BG color — leftover scene without the object."""
    a = alpha.astype(np.float32) / 255.0
    bg = _estimate_bg_color(rgb.astype(np.float32), alpha)
    out = rgb.astype(np.float32) * (1.0 - a)[..., None] + bg * a[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)
