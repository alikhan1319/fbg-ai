"""Image-type classification for type-aware segmentation."""

from __future__ import annotations

import cv2
import numpy as np


def classify_image_type(rgb: np.ndarray) -> str:
    """
    signature | logo | passport | human | vehicle | product | graphic | general
    """
    h, w = rgb.shape[:2]
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    aspect = h / max(float(w), 1.0)
    area = h * w

    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]], axis=0)
    border_white = float(
        np.mean(
            (border[:, 0] >= 235)
            & (border[:, 1] >= 235)
            & (border[:, 2] >= 235)
            & ((border.max(axis=1) - border.min(axis=1)) <= 24)
        )
    )
    # Cream / off-white paper (common for signature photos)
    border_paper = float(np.mean(border.mean(axis=1) >= 210))
    border_dark = float(np.mean(border.mean(axis=1) <= 40))
    bright = float(np.mean(gray > 200))
    dark = float(np.mean(gray < 55))
    mid = float(np.mean((gray > 55) & (gray < 200)))
    edges = cv2.Canny(gray, 70, 150)
    edge_ratio = float(np.mean(edges > 0))
    sat = float(np.mean(hsv[:, :, 1] > 40))

    hch, sch, vch = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    skin = ((hch <= 25) | (hch >= 160)) & (sch >= 25) & (sch <= 180) & (vch >= 50) & (vch <= 250)
    skin_ratio = float(np.mean(skin))

    # Colorful filled marks on light field → logo (never signature)
    colorful_fill = sat > 0.12 and mid > 0.10
    # Sparse pen ink on paper → signature
    sparse_ink = dark < 0.12 and mid < 0.12 and sat < 0.20

    paperish = border_white > 0.45 or (border_paper > 0.55 and bright > 0.35)
    if paperish and bright > 0.4 and area <= 1_600_000 and skin_ratio < 0.06:
        if colorful_fill:
            return "logo"
        if sparse_ink or (dark < 0.15 and mid < 0.18 and edge_ratio < 0.12):
            return "signature"
        if border_white > 0.45 and mid < 0.45 and edge_ratio > 0.015:
            return "logo"

    if border_dark > 0.4 and area <= 1_200_000 and mid < 0.55:
        return "logo"
    if area <= 700_000 and mid < 0.42 and edge_ratio > 0.02 and (border_white > 0.35 or sat > 0.1):
        if skin_ratio < 0.05 and colorful_fill:
            return "logo"
        if skin_ratio < 0.05 and sparse_ink:
            return "signature"
        if skin_ratio < 0.05:
            return "logo"

    if skin_ratio > 0.07:
        if aspect > 1.12 and bright > 0.22 and skin_ratio > 0.09:
            return "passport"
        return "human"
    if border_white > 0.5 and bright > 0.35 and mid < 0.45 and area > 700_000:
        return "product"
    if dark > 0.2 and bright < 0.3 and edge_ratio > 0.035:
        return "graphic"
    if aspect < 0.95 and dark > 0.15 and mid > 0.25 and area > 500_000:
        return "vehicle"
    return "general"


def refine_type_with_mask(image_type: str, alpha: np.ndarray) -> str:
    a = alpha > 40
    if not np.any(a):
        return image_type
    ys, xs = np.where(a)
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    h, w = alpha.shape
    bw, bh = x1 - x0 + 1, y1 - y0 + 1
    cy = ((y0 + y1) * 0.5) / max(h, 1)
    fg = float(np.mean(a))
    box_aspect = bw / max(float(bh), 1.0)

    binary = a.astype(np.uint8)
    num, _labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    thin_upper = 0
    for i in range(1, num):
        _x, y, bw_i, bh_i, area = stats[i]
        if area < 40:
            continue
        if y < 0.45 * h and bh_i / max(float(bw_i), 1.0) >= 2.2 and bw_i < 0.14 * w:
            thin_upper += 1
    if thin_upper >= 2 and image_type in {"general", "product", "graphic", "vehicle"}:
        return "graphic"
    if image_type == "graphic" and box_aspect > 1.15 and cy > 0.45:
        return "vehicle"
    if image_type == "general" and fg < 0.35 and cy > 0.5 and box_aspect > 1.2:
        return "vehicle"
    if image_type == "general" and fg < 0.2 and bh < 0.45 * h and cy < 0.55:
        return "logo"
    return image_type
