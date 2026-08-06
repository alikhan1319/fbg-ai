"""
End-to-end cutout pipeline:
  classify → SAM2 initial mask → BiRefNet refine → PyMatting → RGBA PNG sheets
"""

from __future__ import annotations

import io
import logging
import os
import threading
from typing import Any

import cv2
import numpy as np
from PIL import Image, ImageOps

from .benchmark import new_timer
from .birefnet_engine import BiRefNetEngine
from .classify import classify_image_type, refine_type_with_mask
from .device import empty_cache, resolve_device
from .logo_engine import cutout_logo_alpha, force_logo_alpha, looks_like_logo_or_mark
from .matting import refine_alpha_matting
from .polish import background_sheet, refine_cutout_rgba
from .sam2_engine import Sam2Engine
from .signature_engine import cutout_signature_alpha, force_signature_alpha

logger = logging.getLogger("fbr-ai.seg.pipeline")

_pipeline_lock = threading.Lock()
_pipeline_singleton: "SegmentationPipeline | None" = None


def get_pipeline() -> "SegmentationPipeline":
    global _pipeline_singleton
    if _pipeline_singleton is None:
        with _pipeline_lock:
            if _pipeline_singleton is None:
                _pipeline_singleton = SegmentationPipeline()
    return _pipeline_singleton


def _png_bytes(arr: np.ndarray) -> bytes:
    if arr.ndim == 2:
        img = Image.fromarray(arr, mode="L")
    elif arr.shape[2] == 4:
        img = Image.fromarray(arr, mode="RGBA")
    else:
        img = Image.fromarray(arr, mode="RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


class SegmentationPipeline:
    def __init__(self) -> None:
        self.device = resolve_device()
        self.max_edge = int(os.getenv("SEG_MAX_EDGE", os.getenv("REMBG_MAX_EDGE", "1024")))
        self.bench = os.getenv("SEG_BENCH", "1").strip() not in {"0", "false", "False"}
        self.sam2 = Sam2Engine()
        self.birefnet = BiRefNetEngine()
        logger.info(
            "SegmentationPipeline created (device=%s max_edge=%s) — models load lazily",
            self.device,
            self.max_edge,
        )

    def status(self) -> dict[str, Any]:
        return {
            "device": self.device,
            "max_edge": self.max_edge,
            "sam2_backend": self.sam2.backend,
            "sam2_error": self.sam2.error,
            "birefnet_backend": self.birefnet.backend,
            "birefnet_error": self.birefnet.error,
            "pipeline": "sam2->birefnet->pymatting",
        }

    def warm_lazy(self) -> None:
        """Optional warmup (still lazy until first ensure_loaded)."""
        logger.info("Warming segmentation engines on %s …", self.device)
        try:
            self.sam2.ensure_loaded()
        except Exception as exc:
            logger.warning("SAM2 warm failed: %s", exc)
        try:
            self.birefnet.ensure_loaded()
        except Exception as exc:
            logger.warning("BiRefNet warm failed: %s", exc)

    def _prepare(self, raw: bytes) -> tuple[np.ndarray, tuple[int, int] | None]:
        img = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGBA")
        original = img.size
        w, h = img.size
        if max(w, h) <= self.max_edge:
            return np.array(img), None
        scale = self.max_edge / max(w, h)
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
        logger.info("Downscaled %dx%d → %dx%d", w, h, nw, nh)
        return np.array(resized), original

    def remove(self, raw: bytes) -> tuple[bytes, str, str, bytes]:
        """
        Returns (object_png, model_label, image_type, background_png)
        """
        timer = new_timer(self.bench)
        try:
            with timer.track("prepare"):
                rgba_in, original_size = self._prepare(raw)
                rgb = rgba_in[:, :, :3]

            with timer.track("classify"):
                image_type = classify_image_type(rgb)
                # Do NOT reclassify signatures into logos — logo path stays separate
                if image_type not in {"signature", "logo"} and looks_like_logo_or_mark(rgb):
                    image_type = "logo"
                logger.info("classify → %s", image_type)

            used_special = False
            model_extra = ""

            # --- Signature path (dedicated engine; logo code untouched) ---
            if image_type == "signature":
                with timer.track("signature"):
                    sig_alpha = cutout_signature_alpha(rgb)
                if sig_alpha is not None and int(np.count_nonzero(sig_alpha > 15)) >= 12:
                    alpha = sig_alpha
                    model_extra = "signature-engine"
                else:
                    alpha = force_signature_alpha(rgb)
                    model_extra = "signature-force"
                used_special = True

            # --- Logo path (unchanged behavior) ---
            elif image_type == "logo" or looks_like_logo_or_mark(rgb):
                with timer.track("logo"):
                    logo_alpha = cutout_logo_alpha(rgb, image_type="logo")
                if logo_alpha is not None and float(np.mean(logo_alpha > 12)) >= 0.002:
                    alpha = logo_alpha
                    model_extra = "logo-engine"
                else:
                    alpha = force_logo_alpha(rgb)
                    model_extra = "logo-force"
                used_special = True
                if image_type not in {"logo", "graphic"}:
                    image_type = "logo"

            if not used_special:
                with timer.track("sam2"):
                    prior = self.sam2.initial_mask(rgb, image_type=image_type)

                with timer.track("birefnet"):
                    alpha = self.birefnet.refine_mask(rgb, prior_mask=prior)

                image_type = refine_type_with_mask(image_type, alpha)

                # If neural mask collapsed (empty / near-white only), try logo engine rescue
                fg = float(np.mean(alpha > 20))
                if fg < 0.01 or looks_like_logo_or_mark(rgb):
                    rescue = cutout_logo_alpha(rgb, image_type="logo")
                    if rescue is not None and float(np.mean(rescue > 20)) > fg:
                        alpha = rescue
                        used_special = True
                        model_extra = "logo-rescue"
                        image_type = "logo"

                if not used_special:
                    with timer.track("matting"):
                        alpha = refine_alpha_matting(rgb, alpha, image_type=image_type)

            with timer.track("polish"):
                rgb_c, alpha = refine_cutout_rgba(rgb, alpha, image_type=image_type)
                object_rgba = np.dstack([rgb_c, alpha])

            if original_size:
                with timer.track("upsample"):
                    full = np.array(ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGBA"))
                    ow, oh = original_size
                    rgb_full = full[:, :, :3]
                    a_full = cv2.resize(alpha, (ow, oh), interpolation=cv2.INTER_LINEAR)
                    rgb_full, a_full = refine_cutout_rgba(rgb_full, a_full, image_type=image_type)
                    object_rgba = np.dstack([rgb_full, a_full])

            bg = background_sheet(object_rgba[:, :, :3], object_rgba[:, :, 3])
            if used_special:
                model_label = model_extra or "special-engine"
            else:
                model_label = f"{self.sam2.backend}+{self.birefnet.backend}"
            timer.log(extra=f"type={image_type}")
            return _png_bytes(object_rgba), model_label, image_type, _png_bytes(bg)
        finally:
            empty_cache()
