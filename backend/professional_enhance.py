"""
Professional same-resolution image enhancement.

Studio-grade pipeline:
  - Subject-aware quality analysis (portrait/bokeh safe)
  - Luminance-only sharpening (no color halos)
  - Edge-aware denoise + chroma noise cleanup
  - Natural color polish (LAB vibrance + mild tone)
  - Real-ESRGAN recovery only for genuinely soft images
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Literal

import cv2
import numpy as np

LOGGER = logging.getLogger("professional-enhance")

MAX_WORK_EDGE = 3200
AI_WORK_EDGE = 1024
AI_SKIP_PIXELS = 600_000


class EnhanceTier(str, Enum):
    STUDIO = "studio"       # sharp / portrait — pro polish, no heavy AI
    RECOVER = "recover"     # moderately soft — light AI assist + blend
    RESCUE = "rescue"       # genuinely blurry — stronger AI recovery


@dataclass
class EnhanceAnalysis:
    blur_score: float
    high_key: bool
    has_face: bool
    blockiness: float
    tier: EnhanceTier


def _resize_long_edge(bgr: np.ndarray, max_edge: int) -> tuple[np.ndarray, float]:
    h, w = bgr.shape[:2]
    long_edge = max(h, w)
    if long_edge <= max_edge:
        return bgr, 1.0
    scale = max_edge / float(long_edge)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    return cv2.resize(bgr, (new_w, new_h), interpolation=cv2.INTER_AREA), scale


def _measure_blur(bgr: np.ndarray) -> float:
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


def _detect_faces(gray: np.ndarray) -> list[tuple[int, int, int, int]]:
    cascade = cv2.CascadeClassifier(str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"))
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
    return [(int(x), int(y), int(w), int(h)) for x, y, w, h in faces]


def _subject_blur_score(bgr: np.ndarray) -> float:
    scores = [_measure_blur(bgr)]
    h, w = bgr.shape[:2]
    ch, cw = int(h * 0.55), int(w * 0.55)
    y0, x0 = (h - ch) // 2, (w - cw) // 2
    scores.append(_measure_blur(bgr[y0 : y0 + ch, x0 : x0 + cw]))
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    for x, y, fw, fh in _detect_faces(gray)[:2]:
        pad_x, pad_y = int(fw * 0.12), int(fh * 0.12)
        x1, y1 = max(0, x - pad_x), max(0, y - pad_y)
        x2, y2 = min(w, x + fw + pad_x), min(h, y + fh + pad_y)
        scores.append(_measure_blur(bgr[y1:y2, x1:x2]))
    return float(max(scores))


def _is_high_key(bgr: np.ndarray) -> bool:
    y = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)[:, :, 0]
    mean_luma = float(np.mean(y))
    bright_ratio = float(np.mean(y >= 195))
    p90 = float(np.percentile(y, 90))
    return (
        mean_luma >= 138.0
        or (mean_luma >= 122.0 and bright_ratio >= 0.10)
        or p90 >= 208.0
        or bright_ratio >= 0.16
    )


def _estimate_blockiness(gray: np.ndarray) -> float:
    if gray.shape[0] < 16 or gray.shape[1] < 16:
        return 0.0
    v_edges = np.abs(np.diff(gray.astype(np.float32), axis=1))
    h_edges = np.abs(np.diff(gray.astype(np.float32), axis=0))
    v_grid = v_edges[:, 7::8]
    h_grid = h_edges[7::8, :]
    v_non = np.delete(v_edges, np.s_[7::8], axis=1)
    h_non = np.delete(h_edges, np.s_[7::8], axis=0)
    grid_mean = float(np.mean(v_grid) + np.mean(h_grid))
    non_mean = float(np.mean(v_non) + np.mean(h_non) + 1e-6)
    return max(0.0, grid_mean / non_mean - 1.0)


def _analyze(bgr: np.ndarray) -> EnhanceAnalysis:
    blur_score = _subject_blur_score(bgr)
    high_key = _is_high_key(bgr)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    has_face = len(_detect_faces(gray)) > 0
    blockiness = _estimate_blockiness(gray)

    if blur_score < 32 and not has_face:
        tier = EnhanceTier.RESCUE
    elif blur_score < 55 and not has_face and not high_key:
        tier = EnhanceTier.RECOVER
    elif has_face or blur_score >= 38 or high_key:
        tier = EnhanceTier.STUDIO
    else:
        tier = EnhanceTier.RECOVER

    return EnhanceAnalysis(
        blur_score=blur_score,
        high_key=high_key,
        has_face=has_face,
        blockiness=blockiness,
        tier=tier,
    )


def _mean_luma(bgr: np.ndarray) -> float:
    return float(cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)[:, :, 0].mean())


def _face_mean_luma(bgr: np.ndarray) -> float | None:
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    faces = _detect_faces(gray)
    if not faces:
        return None
    x, y, fw, fh = faces[0]
    pad_x, pad_y = int(fw * 0.1), int(fh * 0.1)
    h, w = bgr.shape[:2]
    x1, y1 = max(0, x - pad_x), max(0, y - pad_y)
    x2, y2 = min(w, x + fw + pad_x), min(h, y + fh + pad_y)
    return _mean_luma(bgr[y1:y2, x1:x2])


def _is_bright_photo(bgr: np.ndarray, *, has_face: bool = False) -> bool:
    """Broader than high_key — catches bright portraits that CLAHE/denoise would darken."""
    if _is_high_key(bgr):
        return True
    if has_face:
        face_luma = _face_mean_luma(bgr)
        if face_luma is not None and face_luma >= 105.0:
            return True
    y = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)[:, :, 0]
    mean_luma = float(np.mean(y))
    p75 = float(np.percentile(y, 75))
    h, w = bgr.shape[:2]
    ch, cw = int(h * 0.5), int(w * 0.5)
    y0, x0 = (h - ch) // 2, (w - cw) // 2
    center_luma = _mean_luma(bgr[y0 : y0 + ch, x0 : x0 + cw])
    if center_luma >= 118.0:
        return True
    return mean_luma >= 118.0 or p75 >= 165.0


def _lock_brightness(reference: np.ndarray, candidate: np.ndarray, *, has_face: bool = False) -> np.ndarray:
    """
    Never let enhancement darken the photo. Bright portraits must stay bright.
    """
    ref_yuv = cv2.cvtColor(reference, cv2.COLOR_BGR2YUV)
    cand_yuv = cv2.cvtColor(candidate, cv2.COLOR_BGR2YUV)
    ref_y = ref_yuv[:, :, 0].astype(np.float32)
    cand_y = cand_yuv[:, :, 0].astype(np.float32)

    ref_mean = float(ref_y.mean())
    cand_mean = float(cand_y.mean())
    bright = _is_bright_photo(reference, has_face=has_face)

    if cand_mean > 1e-6:
        if bright:
            # Bright portraits must never look darker than the original.
            if cand_mean < ref_mean:
                gain = min(1.35, ref_mean / cand_mean)
                cand_y = np.clip(cand_y * gain, 0, 255)
            elif cand_mean > ref_mean * 1.03:
                gain = float(np.clip(ref_mean / cand_mean, 0.97, 1.0))
                cand_y = np.clip(cand_y * gain, 0, 255)
        else:
            floor_mean = ref_mean * 0.985
            if cand_mean < floor_mean:
                gain = min(1.45, floor_mean / cand_mean)
                cand_y = np.clip(cand_y * gain, 0, 255)
            else:
                gain = float(np.clip(ref_mean / cand_mean, 0.99, 1.06))
                cand_y = np.clip(cand_y * gain, 0, 255)

    if bright:
        ref_p90 = float(np.percentile(ref_y, 90))
        cand_p90 = float(np.percentile(cand_y, 90))
        if cand_p90 < ref_p90 * 0.98 and cand_p90 > 1e-6:
            lift = min(1.25, (ref_p90 * 0.99) / cand_p90)
            cand_y = np.clip(cand_y * lift, 0, 255)

    if has_face:
        gray = cv2.cvtColor(reference, cv2.COLOR_BGR2GRAY)
        faces = _detect_faces(gray)
        if faces:
            x, y, fw, fh = faces[0]
            h, w = reference.shape[:2]
            pad_x, pad_y = int(fw * 0.12), int(fh * 0.12)
            x1, y1 = max(0, x - pad_x), max(0, y - pad_y)
            x2, y2 = min(w, x + fw + pad_x), min(h, y + fh + pad_y)
            ref_face = float(ref_y[y1:y2, x1:x2].mean())
            cand_face = float(cand_y[y1:y2, x1:x2].mean())
            if cand_face < ref_face * 0.99 and cand_face > 1e-6:
                fgain = min(1.35, (ref_face * 0.995) / cand_face)
                cand_y[y1:y2, x1:x2] = np.clip(cand_y[y1:y2, x1:x2] * fgain, 0, 255)

    cand_yuv[:, :, 0] = cand_y.astype(np.uint8)
    return cv2.cvtColor(cand_yuv, cv2.COLOR_YUV2BGR)


def _preserve_luma(reference: np.ndarray, candidate: np.ndarray, *, has_face: bool = False) -> np.ndarray:
    return _lock_brightness(reference, candidate, has_face=has_face)


def _luma_unsharp(
    bgr: np.ndarray,
    amount: float,
    sigma: float = 0.9,
    *,
    brighten_only: bool = False,
    floor_y: np.ndarray | None = None,
) -> np.ndarray:
    if amount <= 0:
        return bgr
    yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)
    y = yuv[:, :, 0].astype(np.float32)
    blur = cv2.GaussianBlur(y, (0, 0), sigmaX=sigma, sigmaY=sigma)
    high = y - blur
    if brighten_only:
        y = y + amount * np.maximum(high, 0.0)
    else:
        y = y + amount * high
    if floor_y is not None:
        y = np.maximum(y, floor_y.astype(np.float32))
    y = np.clip(y, 0, 255)
    yuv[:, :, 0] = y.astype(np.uint8)
    return cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)


def _enforce_luma_floor(
    reference: np.ndarray,
    candidate: np.ndarray,
    *,
    floor_ratio: float = 1.0,
    lift_mean: bool = False,
) -> np.ndarray:
    """Per-pixel guarantee: output is never darker than original (fixes black shadows)."""
    ref_yuv = cv2.cvtColor(reference, cv2.COLOR_BGR2YUV)
    cand_yuv = cv2.cvtColor(candidate, cv2.COLOR_BGR2YUV)
    ref_y = ref_yuv[:, :, 0].astype(np.float32)
    cand_y = cand_yuv[:, :, 0].astype(np.float32)

    floor = ref_y * floor_ratio
    cand_y = np.maximum(cand_y, floor)

    if lift_mean:
        ref_mean = float(ref_y.mean())
        cand_mean = float(cand_y.mean())
        target_mean = ref_mean * 1.02
        if cand_mean < target_mean and cand_mean > 1e-6:
            gain = min(1.15, target_mean / cand_mean)
            cand_y = np.clip(cand_y * gain, floor, 255)

    cand_yuv[:, :, 0] = np.clip(cand_y, 0, 255).astype(np.uint8)
    return cv2.cvtColor(cand_yuv, cv2.COLOR_YUV2BGR)


def _pro_denoise(
    bgr: np.ndarray,
    strength: float,
    high_key: bool,
    *,
    has_face: bool = False,
    protect_brightness: bool = False,
) -> np.ndarray:
    if strength <= 0.02:
        return bgr
    bright = protect_brightness or high_key or _is_bright_photo(bgr, has_face=has_face)

    if bright:
        # Chroma-only cleanup — never smooth luminance on bright photos (causes grey/dark look).
        if strength < 0.12:
            return bgr
        yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)
        sc = int(10 + strength * 12)
        yuv[:, :, 1] = cv2.bilateralFilter(yuv[:, :, 1], 3, sc, sc)
        yuv[:, :, 2] = cv2.bilateralFilter(yuv[:, :, 2], 3, sc, sc)
        return cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)

    h, w = bgr.shape[:2]
    if strength < 0.35:
        yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)
        sc = int(14 + strength * 18)
        yuv[:, :, 1] = cv2.bilateralFilter(yuv[:, :, 1], 3, sc, sc)
        yuv[:, :, 2] = cv2.bilateralFilter(yuv[:, :, 2], 3, sc, sc)
        return cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)

    if h * w < AI_SKIP_PIXELS:
        h_param = 3 + int(round(strength * 3))
        out = cv2.fastNlMeansDenoisingColored(
            bgr, None, h=max(3, h_param), hColor=max(3, h_param),
            templateWindowSize=7, searchWindowSize=21,
        )
        return _lock_brightness(bgr, out, has_face=has_face)
    return cv2.bilateralFilter(bgr, 5, int(22 + strength * 18), int(22 + strength * 18))


def _jpeg_artifact_cleanup(bgr: np.ndarray, blockiness: float, *, has_face: bool = False) -> np.ndarray:
    if blockiness < 0.18:
        return bgr
    strength = min(0.40, 0.15 + blockiness * 0.45)
    bright = _is_bright_photo(bgr, has_face=has_face)
    return _pro_denoise(bgr, strength, _is_high_key(bgr), has_face=has_face, protect_brightness=bright)


def _pro_color_polish(
    bgr: np.ndarray,
    strength: float,
    high_key: bool,
    *,
    has_face: bool = False,
) -> np.ndarray:
    if strength <= 0.02:
        return bgr
    bright = high_key or _is_bright_photo(bgr, has_face=has_face)
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l_mean = float(l.mean())

    if bright:
        # CLAHE darkens bright portraits — use chroma vibrance only.
        chroma_boost = 1.0 + strength * 0.022
        a = np.clip(a.astype(np.float32) * chroma_boost, 0, 255).astype(np.uint8)
        b = np.clip(b.astype(np.float32) * chroma_boost, 0, 255).astype(np.uint8)
        return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)

    clip = 1.1 + strength * 0.35
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8))
    l_eq = clahe.apply(l)
    blend = strength * 0.14
    l_out = cv2.addWeighted(l, 1.0 - blend, l_eq, blend, 0).astype(np.float32)
    l_out = np.clip(l_out + (l_mean - float(l_out.mean())) * 1.0, 0, 255).astype(np.uint8)

    chroma_boost = 1.0 + strength * 0.028
    a = np.clip(a.astype(np.float32) * chroma_boost, 0, 255).astype(np.uint8)
    b = np.clip(b.astype(np.float32) * chroma_boost, 0, 255).astype(np.uint8)
    out = cv2.cvtColor(cv2.merge([l_out, a, b]), cv2.COLOR_LAB2BGR)
    return _lock_brightness(bgr, out, has_face=has_face)


def _studio_enhance(
    bgr: np.ndarray,
    analysis: EnhanceAnalysis,
    sharpen: int,
    denoise: int,
) -> np.ndarray:
    """Professional polish for portraits and high-quality photos."""
    s = float(np.clip(sharpen, 0, 100)) / 100.0
    d = float(np.clip(denoise, 0, 100)) / 100.0

    bright = analysis.has_face or analysis.high_key or _is_bright_photo(bgr, has_face=analysis.has_face)
    out = _jpeg_artifact_cleanup(bgr, analysis.blockiness, has_face=analysis.has_face)
    out = _pro_denoise(
        out,
        d * (0.22 if bright else 0.45),
        analysis.high_key,
        has_face=analysis.has_face,
        protect_brightness=bright,
    )
    out = _pro_color_polish(
        out,
        0.22 + s * (0.28 if bright else 0.42),
        analysis.high_key,
        has_face=analysis.has_face,
    )

    ref_y = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)[:, :, 0]
    sharp_amt = 0.18 + s * (0.18 if bright else 0.32)
    if analysis.has_face:
        sharp_amt *= 0.95
    out = _luma_unsharp(
        out,
        sharp_amt,
        sigma=0.8 if bright else 0.9,
        brighten_only=bright or analysis.has_face,
        floor_y=ref_y,
    )
    out = _enforce_luma_floor(bgr, out, floor_ratio=1.0, lift_mean=bright or analysis.has_face)
    return _enforce_luma_floor(bgr, out, floor_ratio=1.0, lift_mean=analysis.has_face)


def _luminance_blend(original: np.ndarray, enhanced: np.ndarray, alpha: float) -> np.ndarray:
    orig_yuv = cv2.cvtColor(original, cv2.COLOR_BGR2YUV)
    enh_yuv = cv2.cvtColor(enhanced, cv2.COLOR_BGR2YUV)
    orig_y = orig_yuv[:, :, 0].astype(np.float32)
    enh_y = enh_yuv[:, :, 0].astype(np.float32)
    edge = np.abs(cv2.Laplacian(orig_y, cv2.CV_32F))
    edge_norm = edge / (edge.max() + 1e-6)
    local_alpha = alpha * (0.55 + 0.45 * edge_norm)
    y_blend = orig_y * (1.0 - local_alpha) + enh_y * local_alpha
    y_blend = np.maximum(y_blend, orig_y)
    orig_yuv[:, :, 0] = np.clip(y_blend, 0, 255).astype(np.uint8)
    chroma_alpha = alpha * 0.45
    orig_yuv[:, :, 1] = cv2.addWeighted(orig_yuv[:, :, 1], 1.0 - chroma_alpha, enh_yuv[:, :, 1], chroma_alpha, 0)
    orig_yuv[:, :, 2] = cv2.addWeighted(orig_yuv[:, :, 2], 1.0 - chroma_alpha, enh_yuv[:, :, 2], chroma_alpha, 0)
    return _lock_brightness(original, cv2.cvtColor(orig_yuv, cv2.COLOR_YUV2BGR), has_face=False)


def _ai_recover(
    bgr: np.ndarray,
    analysis: EnhanceAnalysis,
    sharpen: int,
    denoise: int,
    *,
    strong: bool,
) -> np.ndarray:
    from advanced_upscale import _adaptive_tile, _get_cached_upsampler, UpscaleConfig

    orig_h, orig_w = bgr.shape[:2]
    work, _ = _resize_long_edge(bgr, AI_WORK_EDGE)
    config = UpscaleConfig(face_restore=False)
    upsampler = _get_cached_upsampler(config)

    d = float(np.clip(denoise, 0, 100)) / 100.0
    if d > 0.15 and work.shape[0] * work.shape[1] < AI_SKIP_PIXELS:
        h_param = 3 + int(round(d * 3))
        work = cv2.fastNlMeansDenoisingColored(
            work, None, h=max(3, h_param), hColor=max(3, h_param),
            templateWindowSize=7, searchWindowSize=21,
        )

    upsampler.tile = _adaptive_tile(work.shape[0], work.shape[1], api_mode=True)
    outscale = 2.0 if not strong else 2.0
    enhanced_work, _ = upsampler.enhance(work, outscale=outscale)
    enhanced = cv2.resize(enhanced_work, (orig_w, orig_h), interpolation=cv2.INTER_LANCZOS4)

    if analysis.blur_score < 45:
        alpha = 0.52 if strong else 0.38
    elif analysis.blur_score < 70:
        alpha = 0.38 if strong else 0.28
    else:
        alpha = 0.22

    if analysis.high_key:
        alpha *= 0.65
    if analysis.has_face:
        alpha *= 0.75

    blended = _luminance_blend(bgr, enhanced, alpha)
    s = float(np.clip(sharpen, 0, 100)) / 100.0
    ref_y = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)[:, :, 0]
    out = _luma_unsharp(
        blended, 0.10 + s * 0.18, sigma=0.9,
        brighten_only=True, floor_y=ref_y,
    )
    return _enforce_luma_floor(
        bgr, out, floor_ratio=1.0, lift_mean=analysis.has_face or analysis.high_key,
    )


def professional_enhance_bgr(
    bgr: np.ndarray,
    *,
    sharpen: int = 40,
    denoise: int = 25,
) -> tuple[np.ndarray, EnhanceAnalysis]:
    work, scale = _resize_long_edge(bgr, MAX_WORK_EDGE)
    analysis = _analyze(work)

    LOGGER.info(
        "Enhance tier=%s blur=%.1f high_key=%s face=%s block=%.2f",
        analysis.tier.value,
        analysis.blur_score,
        analysis.high_key,
        analysis.has_face,
        analysis.blockiness,
    )

    if analysis.tier == EnhanceTier.STUDIO:
        result = _studio_enhance(work, analysis, sharpen, denoise)
    elif analysis.tier == EnhanceTier.RECOVER:
        try:
            result = _ai_recover(work, analysis, sharpen, denoise, strong=False)
        except Exception as exc:
            LOGGER.warning("AI recover failed (%s), using studio fallback", exc)
            result = _studio_enhance(work, analysis, sharpen, denoise)
    else:
        try:
            result = _ai_recover(work, analysis, sharpen, denoise, strong=True)
        except Exception as exc:
            LOGGER.warning("AI rescue failed (%s), using studio fallback", exc)
            result = _studio_enhance(work, analysis, max(sharpen, 50), max(denoise, 35))

    if scale < 1.0:
        h, w = bgr.shape[:2]
        result = cv2.resize(result, (w, h), interpolation=cv2.INTER_LANCZOS4)

    protect = analysis.has_face or analysis.high_key or _is_bright_photo(bgr, has_face=analysis.has_face)
    result = _enforce_luma_floor(
        bgr,
        result,
        floor_ratio=1.0 if protect else 0.97,
        lift_mean=protect,
    )
    return result, analysis


def professional_enhance_bytes(
    raw_bytes: bytes,
    *,
    sharpen: int = 40,
    denoise: int = 25,
    output_format: Literal["png", "jpg"] = "jpg",
) -> tuple[bytes, float, str]:
    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Could not decode image bytes.")

    enhanced, analysis = professional_enhance_bgr(bgr, sharpen=sharpen, denoise=denoise)
    engine = f"pro-{analysis.tier.value}"

    if output_format == "png":
        ok, enc = cv2.imencode(".png", enhanced, [cv2.IMWRITE_PNG_COMPRESSION, 2])
    else:
        ok, enc = cv2.imencode(".jpg", enhanced, [cv2.IMWRITE_JPEG_QUALITY, 97])
    if not ok:
        raise RuntimeError("Failed to encode enhanced image.")
    return enc.tobytes(), analysis.blur_score, engine
