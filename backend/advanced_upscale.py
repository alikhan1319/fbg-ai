"""
Advanced photo upscaling pipeline (Canva-class quality target).

Highlights:
- Real-ESRGAN based super-resolution (x2/x4 and multi-pass)
- Optional GFPGAN face restoration for portraits
- JPEG artifact pre-clean + adaptive post-sharpen
- GPU first, CPU fallback
- 2K/4K target sizing helper

Usage:
    from advanced_upscale import upscale_image
    upscale_image("in.jpg", "out.png", target_size="4K")
"""

from __future__ import annotations

import argparse
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
import torch

LOGGER = logging.getLogger("advanced-upscale")
_CACHED_UPSAMPLER = None
_CACHED_RESTORER = None

# API limits — keeps CPU upscales fast and reliable for all user uploads
API_MAX_INPUT_LONG_EDGE = 1024
API_ENHANCE_INPUT_LONG_EDGE = 1280
API_MAX_OUTPUT_LONG_EDGE = 3840
API_SKIP_NLMEANS_PIXELS = 600_000
API_FACE_RESTORE_MAX_PIXELS = 1_200_000


TargetSize = Literal["2K", "4K", "x2", "x3", "x4"]
ModelName = Literal["realesr-general-x4v3", "realesrgan-x4plus"]


@dataclass
class UpscaleConfig:
    target_size: TargetSize = "4K"
    model_name: ModelName = "realesr-general-x4v3"
    face_restore: bool = False
    output_format: Literal["png", "jpg"] = "png"
    jpg_quality: int = 96
    tile: int = 512
    tile_pad: int = 20
    denoise_strength: float = 0.0


def _setup_logging() -> None:
    if not LOGGER.handlers:
        logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def _device_and_half() -> tuple[torch.device, bool]:
    if torch.cuda.is_available():
        return torch.device("cuda"), True
    return torch.device("cpu"), False


def _import_realesrgan():
    from basicsr.archs.rrdbnet_arch import RRDBNet
    from basicsr.archs.srvgg_arch import SRVGGNetCompact
    from realesrgan import RealESRGANer
    from realesrgan.utils import load_file_from_url

    return RRDBNet, SRVGGNetCompact, RealESRGANer, load_file_from_url


def _build_upsampler(config: UpscaleConfig):
    RRDBNet, SRVGGNetCompact, RealESRGANer, load_file_from_url = _import_realesrgan()
    device, half = _device_and_half()
    model_dir = Path(__file__).resolve().parent / "weights"
    model_dir.mkdir(parents=True, exist_ok=True)

    if config.model_name == "realesrgan-x4plus":
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=4,
        )
        model_url = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
        model_path = load_file_from_url(model_url, model_dir=str(model_dir), progress=True)
        netscale = 4
    else:
        # Best quality/speed balance for natural photos.
        model = SRVGGNetCompact(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_conv=32,
            upscale=4,
            act_type="prelu",
        )
        model_url = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth"
        model_path = load_file_from_url(model_url, model_dir=str(model_dir), progress=True)
        netscale = 4

    LOGGER.info("Using %s on %s", config.model_name, device)
    upsampler = RealESRGANer(
        scale=netscale,
        model_path=model_path,
        model=model,
        tile=config.tile,
        tile_pad=config.tile_pad,
        pre_pad=0,
        half=half,
        device=device,
    )
    return upsampler


def _get_cached_upsampler(config: UpscaleConfig):
    global _CACHED_UPSAMPLER
    if _CACHED_UPSAMPLER is None:
        _CACHED_UPSAMPLER = _build_upsampler(config)
    return _CACHED_UPSAMPLER


def _build_face_restorer():
    try:
        from gfpgan import GFPGANer
        from realesrgan.utils import load_file_from_url
    except Exception:
        return None

    model_dir = Path(__file__).resolve().parent / "weights"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = load_file_from_url(
        "https://github.com/TencentARC/GFPGAN/releases/download/v1.4.0/GFPGANv1.4.pth",
        model_dir=str(model_dir),
        progress=True,
    )
    return GFPGANer(
        model_path=model_path,
        upscale=1,
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=None,
    )


def _get_cached_face_restorer():
    global _CACHED_RESTORER
    if _CACHED_RESTORER is None:
        _CACHED_RESTORER = _build_face_restorer()
    return _CACHED_RESTORER


def _target_dims(width: int, height: int, target_size: TargetSize) -> tuple[int, int]:
    if target_size == "x2":
        return width * 2, height * 2
    if target_size == "x3":
        return width * 3, height * 3
    if target_size == "x4":
        return width * 4, height * 4

    # 2K / 4K profile: scale by long edge while keeping aspect ratio.
    long_edge_target = 2560 if target_size == "2K" else 3840
    long_edge = max(width, height)
    ratio = max(1.0, long_edge_target / float(long_edge))
    return int(round(width * ratio)), int(round(height * ratio))


def _cap_output_dims(target_w: int, target_h: int, max_long_edge: int) -> tuple[int, int]:
    long_edge = max(target_w, target_h)
    if long_edge <= max_long_edge:
        return target_w, target_h
    ratio = max_long_edge / float(long_edge)
    return max(1, int(round(target_w * ratio))), max(1, int(round(target_h * ratio)))


def _resize_long_edge(bgr: np.ndarray, max_long_edge: int) -> tuple[np.ndarray, float]:
    h, w = bgr.shape[:2]
    long_edge = max(h, w)
    if long_edge <= max_long_edge:
        return bgr, 1.0
    scale = max_long_edge / float(long_edge)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    resized = cv2.resize(bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, scale


def _adaptive_tile(h: int, w: int, *, api_mode: bool = False) -> int:
    if api_mode:
        return 256
    pixels = h * w
    if pixels > 1_800_000:
        return 256
    if pixels > 900_000:
        return 384
    return 512


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


def _preprocess_photo(bgr: np.ndarray, denoise_strength: float, *, allow_slow_denoise: bool = True) -> np.ndarray:
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    blockiness = _estimate_blockiness(gray)
    out = bgr.copy()
    h, w = bgr.shape[:2]
    if not allow_slow_denoise and h * w > API_SKIP_NLMEANS_PIXELS:
        return out

    # JPEG block / mosquito artifact cleanup.
    if blockiness > 0.16 or denoise_strength > 0:
        h = 5 if blockiness > 0.35 else 3
        h = int(round(h + denoise_strength * 3))
        out = cv2.fastNlMeansDenoisingColored(
            out,
            None,
            h=max(3, h),
            hColor=max(3, h),
            templateWindowSize=7,
            searchWindowSize=21,
        )
        out = cv2.bilateralFilter(out, d=5, sigmaColor=42, sigmaSpace=42)

    return out


def _measure_blur_score(bgr: np.ndarray) -> float:
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


def _measure_enhance_blur_score(bgr: np.ndarray) -> float:
    """
    Portrait-safe blur metric: bokeh backgrounds lower full-frame scores even when
    the subject is sharp, which previously triggered destructive over-processing.
    """
    scores = [_measure_blur_score(bgr)]

    h, w = bgr.shape[:2]
    ch, cw = int(h * 0.55), int(w * 0.55)
    y0, x0 = (h - ch) // 2, (w - cw) // 2
    scores.append(_measure_blur_score(bgr[y0 : y0 + ch, x0 : x0 + cw]))

    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier(str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"))
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
    for x, y, fw, fh in faces[:2]:
        pad_x = int(fw * 0.15)
        pad_y = int(fh * 0.15)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(w, x + fw + pad_x)
        y2 = min(h, y + fh + pad_y)
        scores.append(_measure_blur_score(bgr[y1:y2, x1:x2]))

    return float(max(scores))


def _deblur_luma(bgr: np.ndarray, blur_score: float) -> np.ndarray:
    # Adaptive edge recovery before SR to prevent "bright but still blurry" outputs.
    if blur_score >= 140:
        return bgr

    out = bgr.copy()
    yuv = cv2.cvtColor(out, cv2.COLOR_BGR2YUV)
    y = yuv[:, :, 0].astype(np.float32)

    if blur_score < 45:
        sigma = 1.15
        amount = 1.28
        edge_gain = 0.16
    elif blur_score < 90:
        sigma = 1.0
        amount = 0.95
        edge_gain = 0.12
    else:
        sigma = 0.9
        amount = 0.72
        edge_gain = 0.09

    blurred = cv2.GaussianBlur(y, (0, 0), sigmaX=sigma, sigmaY=sigma)
    high = y - blurred
    y = np.clip(y + amount * high, 0, 255)

    # Extra local edge lift for text/fabric detail.
    edge = cv2.Laplacian(y, cv2.CV_32F, ksize=3)
    y = np.clip(y + edge_gain * edge, 0, 255)

    yuv[:, :, 0] = y.astype(np.uint8)
    out = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)
    return out


def _boost_microcontrast(bgr: np.ndarray, strength: float = 0.55) -> np.ndarray:
    yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)
    y = yuv[:, :, 0]
    mean_before = float(np.mean(y))
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    y_clahe = clahe.apply(y)
    yuv[:, :, 0] = cv2.addWeighted(y, 1.0 - strength * 0.22, y_clahe, strength * 0.22, 0)
    mean_after = float(np.mean(yuv[:, :, 0]))
    # Keep natural tone: avoid fake "just brighter" look.
    yuv[:, :, 0] = np.clip(
        yuv[:, :, 0].astype(np.float32) + (mean_before - mean_after) * 0.92,
        0,
        255,
    ).astype(np.uint8)
    out = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)

    soft = cv2.GaussianBlur(out, (0, 0), 1.0)
    high = cv2.subtract(out, soft)
    out = cv2.addWeighted(out, 1.0, high, 0.22 * strength, 0)
    return np.clip(out, 0, 255).astype(np.uint8)


def _post_deblur_enhance(bgr: np.ndarray, blur_score: float, target_size: TargetSize) -> np.ndarray:
    if blur_score >= 180:
        return bgr

    if blur_score < 55:
        amount = 0.62 if target_size in ("x4", "4K") else 0.5
        sigma = 1.0
    elif blur_score < 110:
        amount = 0.48 if target_size in ("x4", "4K") else 0.38
        sigma = 0.95
    else:
        amount = 0.34 if target_size in ("x4", "4K") else 0.26
        sigma = 0.9

    blur = cv2.GaussianBlur(bgr, (0, 0), sigmaX=sigma, sigmaY=sigma)
    out = cv2.addWeighted(bgr, 1.0 + amount, blur, -amount, 0)
    return np.clip(out, 0, 255).astype(np.uint8)


def _contains_face(bgr: np.ndarray) -> bool:
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier(str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"))
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
    return len(faces) > 0


def _run_realesrgan_multi_pass(
    img_bgr: np.ndarray,
    upsampler,
    target_w: int,
    target_h: int,
    *,
    api_mode: bool = False,
) -> np.ndarray:
    h, w = img_bgr.shape[:2]
    needed = max(target_w / float(w), target_h / float(h))
    if needed <= 1.001:
        return cv2.resize(img_bgr, (target_w, target_h), interpolation=cv2.INTER_CUBIC)

    upsampler.tile = _adaptive_tile(h, w, api_mode=api_mode)

    # Single-pass path covers almost all API x2/x4 jobs and is much faster on CPU.
    if needed <= 4.05:
        outscale = float(min(4.0, needed))
        current, _ = upsampler.enhance(img_bgr, outscale=outscale)
        if current.shape[1] != target_w or current.shape[0] != target_h:
            current = cv2.resize(current, (target_w, target_h), interpolation=cv2.INTER_CUBIC)
        return current

    current = img_bgr
    done = 1.0

    while done < needed * 0.999:
        remain = needed / done
        if remain >= 3.1:
            outscale = 4.0
        elif remain >= 1.8:
            outscale = 2.0
        else:
            outscale = min(1.6, remain)

        current, _ = upsampler.enhance(current, outscale=outscale)
        done *= outscale

        # Hard safety cap for memory on giant inputs.
        ch, cw = current.shape[:2]
        if ch * cw > 28_000_000:
            raise RuntimeError("Upscaled image is too large for available memory.")

    if current.shape[1] != target_w or current.shape[0] != target_h:
        current = cv2.resize(current, (target_w, target_h), interpolation=cv2.INTER_CUBIC)
    return current


def _run_pipeline(
    src_bgr: np.ndarray,
    config: UpscaleConfig,
    upsampler,
    *,
    api_mode: bool = False,
) -> np.ndarray:
    h, w = src_bgr.shape[:2]
    target_w, target_h = _target_dims(w, h, config.target_size)
    if api_mode:
        target_w, target_h = _cap_output_dims(target_w, target_h, API_MAX_OUTPUT_LONG_EDGE)

    work = src_bgr
    if api_mode:
        work, _ = _resize_long_edge(src_bgr, API_MAX_INPUT_LONG_EDGE)

    wh, ww = work.shape[:2]
    LOGGER.info(
        "Upscaling %sx%s -> %sx%s (%s, api=%s, work=%sx%s)",
        w,
        h,
        target_w,
        target_h,
        config.target_size,
        api_mode,
        ww,
        wh,
    )

    blur_score = _measure_blur_score(work)
    pre = work if api_mode else _preprocess_photo(work, config.denoise_strength, allow_slow_denoise=True)
    if not api_mode:
        pre = _deblur_luma(pre, blur_score)
    upscaled = _run_realesrgan_multi_pass(pre, upsampler, target_w, target_h, api_mode=api_mode)
    if not api_mode:
        upscaled = _boost_microcontrast(upscaled, strength=0.48 if config.target_size in ("4K", "x4") else 0.4)
        upscaled = _post_deblur_enhance(upscaled, blur_score, config.target_size)
    else:
        upscaled = _boost_microcontrast(upscaled, strength=0.32)

    # Detect faces on source image for speed; avoid scanning huge upscaled frames.
    pixels = h * w
    has_face = (
        config.face_restore
        and (not api_mode or pixels <= API_FACE_RESTORE_MAX_PIXELS)
        and _contains_face(work)
    )
    if has_face:
        restorer = _get_cached_face_restorer()
        if restorer is not None:
            try:
                _, _, restored = restorer.enhance(upscaled, has_aligned=False, only_center_face=False, paste_back=True)
                upscaled = cv2.addWeighted(upscaled, 0.68, restored, 0.32, 0)
            except Exception as exc:
                LOGGER.warning("GFPGAN face restore skipped: %s", exc)

    return upscaled


def upscale_image(input_path: str | Path, output_path: str | Path, target_size: TargetSize = "4K") -> Path:
    """
    Upscale an image to 2K/4K (or x2/x3/x4) using a deep-learning pipeline.

    Args:
        input_path: source image path
        output_path: destination image path
        target_size: "2K", "4K", "x2", "x3", or "x4"
    """
    _setup_logging()
    in_path = Path(input_path)
    out_path = Path(output_path)
    if not in_path.exists():
        raise FileNotFoundError(f"Input image does not exist: {in_path}")

    config = UpscaleConfig(target_size=target_size)

    try:
        upsampler = _get_cached_upsampler(config)
    except Exception as exc:
        raise RuntimeError(
            "Could not initialize Real-ESRGAN. "
            f"Root cause: {exc}. "
            "From backend folder run: .\\.venv311\\Scripts\\python.exe -m pip install "
            '"numpy==1.26.4" "opencv-python-headless==4.9.0.80" && pip uninstall -y opencv-python'
        ) from exc

    src = cv2.imread(str(in_path), cv2.IMREAD_COLOR)
    if src is None:
        raise ValueError(f"Could not read image: {in_path}")
    upscaled = _run_pipeline(src, config, upsampler)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    suffix = out_path.suffix.lower()
    if suffix in (".jpg", ".jpeg") or config.output_format == "jpg":
        ok = cv2.imwrite(str(out_path), upscaled, [cv2.IMWRITE_JPEG_QUALITY, max(95, config.jpg_quality)])
    else:
        ok = cv2.imwrite(str(out_path), upscaled, [cv2.IMWRITE_PNG_COMPRESSION, 2])
    if not ok:
        raise RuntimeError(f"Failed writing output image: {out_path}")

    LOGGER.info("Saved upscaled image -> %s", out_path)
    return out_path


def _mean_luma_bgr(bgr: np.ndarray) -> float:
    yuv = cv2.cvtColor(bgr, cv2.COLOR_BGR2YUV)
    return float(np.mean(yuv[:, :, 0]))


def _is_high_key_image(bgr: np.ndarray) -> bool:
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


def _is_already_excellent(bgr: np.ndarray, blur_score: float) -> bool:
    """Bright, sharp photos should not be run through heavy AI — it causes plastic/painterly artifacts."""
    high_key = _is_high_key_image(bgr)
    has_face = _contains_face(bgr)
    if blur_score >= 160:
        return True
    if high_key and blur_score >= 80:
        return True
    if has_face and blur_score >= 45:
        return True
    return high_key and has_face


def _should_skip_ai_enhance(bgr: np.ndarray, blur_score: float) -> bool:
    high_key = _is_high_key_image(bgr)
    has_face = _contains_face(bgr)
    if has_face and blur_score >= 30:
        return True
    if high_key and blur_score >= 55:
        return True
    return blur_score >= 120


def _gentle_enhance_bgr(
    bgr: np.ndarray,
    *,
    sharpen: int,
    denoise: int,
    blur_score: float,
) -> np.ndarray:
    """Minimal polish for photos that are already bright and sharp."""
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
        blurred = cv2.GaussianBlur(out, (0, 0), 0.75)
        out = cv2.addWeighted(out, 1.0 + amount, blurred, -amount, 0)
        out = np.clip(out, 0, 255).astype(np.uint8)

    return _match_luma(bgr, out)


def _match_luma(reference_bgr: np.ndarray, candidate_bgr: np.ndarray) -> np.ndarray:
    ref_yuv = cv2.cvtColor(reference_bgr, cv2.COLOR_BGR2YUV)
    cand_yuv = cv2.cvtColor(candidate_bgr, cv2.COLOR_BGR2YUV)
    ref_mean = float(ref_yuv[:, :, 0].mean())
    cand_mean = float(cand_yuv[:, :, 0].mean())
    if cand_mean > 1e-6:
        gain = float(np.clip(ref_mean / cand_mean, 0.96, 1.35))
        cand_yuv[:, :, 0] = np.clip(cand_yuv[:, :, 0].astype(np.float32) * gain, 0, 255).astype(np.uint8)
    return cv2.cvtColor(cand_yuv, cv2.COLOR_YUV2BGR)


def _blend_with_original(
    original_bgr: np.ndarray,
    enhanced_bgr: np.ndarray,
    blur_score: float,
    *,
    high_key: bool = False,
) -> np.ndarray:
    """Keep natural tone while letting AI detail show through on soft inputs only."""
    if blur_score < 35:
        alpha = 0.72
    elif blur_score < 80:
        alpha = 0.58
    elif blur_score < 120:
        alpha = 0.42
    elif blur_score < 160:
        alpha = 0.28
    else:
        alpha = 0.14

    if high_key:
        alpha *= 0.55

    blended = cv2.addWeighted(original_bgr, 1.0 - alpha, enhanced_bgr, alpha, 0)
    return _match_luma(original_bgr, blended)


def _apply_user_enhance_controls(
    bgr: np.ndarray,
    *,
    sharpen: int,
    denoise: int,
    blur_score: float,
) -> np.ndarray:
    sharpen = int(np.clip(sharpen, 0, 100))
    denoise = int(np.clip(denoise, 0, 100))
    out = bgr

    # Already-sharp photos need lighter touch from user sliders.
    sharpen_scale = 0.15 if blur_score >= 160 else (0.30 if blur_score >= 100 else 0.55)
    denoise_scale = 0.10 if blur_score >= 140 else (0.25 if blur_score >= 80 else 0.45)
    effective_sharpen = sharpen * sharpen_scale
    effective_denoise = denoise * denoise_scale

    if effective_denoise > 0:
        h, w = out.shape[:2]
        if h * w <= API_SKIP_NLMEANS_PIXELS:
            denoise_h = 3 + int(round(effective_denoise / 28))
            out = cv2.fastNlMeansDenoisingColored(
                out,
                None,
                h=max(3, denoise_h),
                hColor=max(3, denoise_h),
                templateWindowSize=7,
                searchWindowSize=21,
            )
        else:
            out = cv2.bilateralFilter(out, 5, 32, 32)

    if effective_sharpen > 0:
        amount = 0.08 + (effective_sharpen / 100.0) * 0.42
        blurred = cv2.GaussianBlur(out, (0, 0), 0.9)
        out = cv2.addWeighted(out, 1.0 + amount, blurred, -amount, 0)
        out = np.clip(out, 0, 255).astype(np.uint8)

    return out


def enhance_image_bytes(
    raw_bytes: bytes,
    *,
    sharpen: int = 38,
    denoise: int = 22,
    output_format: Literal["png", "jpg"] = "jpg",
    face_restore: bool = True,
    api_mode: bool = True,
) -> tuple[bytes, float, str]:
    """
    Same-resolution enhancement via Real-ESRGAN super-resolve + downscale.
    Returns (encoded_image_bytes, blur_score, engine_label).
    """
    _setup_logging()
    config = UpscaleConfig(output_format=output_format, face_restore=face_restore)
    upsampler = _get_cached_upsampler(config)

    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    src = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if src is None:
        raise ValueError("Could not decode image bytes.")

    orig_h, orig_w = src.shape[:2]
    blur_score = _measure_enhance_blur_score(src)
    high_key = _is_high_key_image(src)

    if _is_already_excellent(src, blur_score):
        LOGGER.info("Gentle preserve path (blur=%.1f, high_key=%s)", blur_score, high_key)
        gentle = _gentle_enhance_bgr(src, sharpen=sharpen, denoise=denoise, blur_score=blur_score)
        if output_format == "png":
            ok, enc = cv2.imencode(".png", gentle, [cv2.IMWRITE_PNG_COMPRESSION, 2])
        else:
            ok, enc = cv2.imencode(".jpg", gentle, [cv2.IMWRITE_JPEG_QUALITY, 96])
        if not ok:
            raise RuntimeError("Failed to encode enhanced image.")
        return enc.tobytes(), blur_score, "gentle-preserve"

    if _should_skip_ai_enhance(src, blur_score):
        LOGGER.info("Skipping Real-ESRGAN for bright/sharp photo (blur=%.1f)", blur_score)
        gentle = _gentle_enhance_bgr(src, sharpen=sharpen, denoise=denoise, blur_score=blur_score)
        if output_format == "png":
            ok, enc = cv2.imencode(".png", gentle, [cv2.IMWRITE_PNG_COMPRESSION, 2])
        else:
            ok, enc = cv2.imencode(".jpg", gentle, [cv2.IMWRITE_JPEG_QUALITY, 96])
        if not ok:
            raise RuntimeError("Failed to encode enhanced image.")
        return enc.tobytes(), blur_score, "gentle-preserve"

    work, _ = _resize_long_edge(src, API_ENHANCE_INPUT_LONG_EDGE)

    denoise_strength = float(np.clip(denoise / 100.0, 0.0, 1.0)) if blur_score < 90 else 0.0
    pre = work if denoise_strength <= 0 else _preprocess_photo(work, denoise_strength, allow_slow_denoise=True)
    if blur_score < 100:
        pre = _deblur_luma(pre, blur_score)

    upsampler.tile = _adaptive_tile(pre.shape[0], pre.shape[1], api_mode=api_mode)
    enhanced_work, _ = upsampler.enhance(pre, outscale=2.0)
    enhanced_full = cv2.resize(enhanced_work, (orig_w, orig_h), interpolation=cv2.INTER_LANCZOS4)
    if blur_score < 120:
        enhanced_full = _boost_microcontrast(enhanced_full, strength=0.18)
    enhanced_full = _blend_with_original(src, enhanced_full, blur_score, high_key=high_key)

    # GFPGAN causes plastic/painterly faces on already-good portraits — never use for enhance.
    enhanced_full = _apply_user_enhance_controls(
        enhanced_full,
        sharpen=sharpen,
        denoise=denoise,
        blur_score=blur_score,
    )
    enhanced_full = _match_luma(src, enhanced_full)

    if output_format == "png":
        ok, enc = cv2.imencode(".png", enhanced_full, [cv2.IMWRITE_PNG_COMPRESSION, 2])
    else:
        ok, enc = cv2.imencode(".jpg", enhanced_full, [cv2.IMWRITE_JPEG_QUALITY, 96])
    if not ok:
        raise RuntimeError("Failed to encode enhanced image.")
    return enc.tobytes(), blur_score, f"realesrgan-enhance-{config.model_name}"


def upscale_image_bytes(
    raw_bytes: bytes,
    target_size: TargetSize = "x4",
    *,
    output_format: Literal["png", "jpg"] = "jpg",
    face_restore: bool = True,
    api_mode: bool = False,
) -> tuple[bytes, str]:
    """
    In-memory upscaling for API endpoints.
    Returns (encoded_image_bytes, engine_label).
    """
    _setup_logging()
    config = UpscaleConfig(
        target_size=target_size,
        output_format=output_format,
        face_restore=face_restore,
    )
    try:
        upsampler = _get_cached_upsampler(config)
    except Exception as exc:
        raise RuntimeError(
            "Could not initialize Real-ESRGAN. "
            f"Root cause: {exc}. "
            "From backend folder run: .\\.venv311\\Scripts\\python.exe -m pip install "
            '"numpy==1.26.4" "opencv-python-headless==4.9.0.80" && pip uninstall -y opencv-python'
        ) from exc

    arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    src = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if src is None:
        raise ValueError("Could not decode image bytes.")

    upscaled = _run_pipeline(src, config, upsampler, api_mode=api_mode)
    if output_format == "png":
        ok, enc = cv2.imencode(".png", upscaled, [cv2.IMWRITE_PNG_COMPRESSION, 2])
    else:
        ok, enc = cv2.imencode(".jpg", upscaled, [cv2.IMWRITE_JPEG_QUALITY, 96])
    if not ok:
        raise RuntimeError("Failed to encode upscaled image.")
    return enc.tobytes(), f"realesrgan-{config.model_name}"


def _cli() -> None:
    parser = argparse.ArgumentParser(description="Advanced Real-ESRGAN upscaler")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output image path")
    parser.add_argument("--target-size", default="4K", choices=["2K", "4K", "x2", "x3", "x4"])
    args = parser.parse_args()
    upscale_image(args.input, args.output, target_size=args.target_size)


if __name__ == "__main__":
    _cli()

