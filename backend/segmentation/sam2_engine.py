"""SAM2 initial mask (lazy). Falls back to a strong OpenCV prior if SAM2 is unavailable."""

from __future__ import annotations

import logging
import os
import threading
from typing import Any

import cv2
import numpy as np

from .device import empty_cache, resolve_device

logger = logging.getLogger("fbr-ai.seg.sam2")


class Sam2Engine:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._predictor: Any = None
        self._backend: str = "unloaded"
        self._error: str | None = None
        self.device = resolve_device()

    @property
    def backend(self) -> str:
        return self._backend

    @property
    def error(self) -> str | None:
        return self._error

    def ensure_loaded(self) -> None:
        if self._predictor is not None or self._backend == "opencv-prior":
            return
        with self._lock:
            if self._predictor is not None or self._backend == "opencv-prior":
                return
            if os.getenv("SEG_DISABLE_SAM2", "0").strip() in {"1", "true", "True"}:
                self._backend = "opencv-prior"
                logger.info("SAM2 disabled via SEG_DISABLE_SAM2 — using OpenCV prior")
                return
            try:
                self._load_ultralytics_sam2()
            except Exception as exc:
                logger.warning("SAM2 load failed (%s) — using OpenCV prior mask", exc)
                self._error = str(exc)
                self._backend = "opencv-prior"
                self._predictor = None

    def _load_ultralytics_sam2(self) -> None:
        from ultralytics import SAM

        weights = os.getenv("SAM2_WEIGHTS", "sam2_b.pt").strip() or "sam2_b.pt"
        logger.info("Loading SAM2 via ultralytics (%s) on %s …", weights, self.device)
        model = SAM(weights)
        # Ultralytics moves to device on predict; keep handle
        self._predictor = model
        self._backend = "ultralytics-sam2"
        logger.info("SAM2 ready (%s)", self._backend)

    def initial_mask(self, rgb: np.ndarray, image_type: str = "general") -> np.ndarray:
        """
        Return uint8 mask 0..255, same HxW as rgb.
        Optimized prompts for portraits, cars, clothing, products.
        """
        self.ensure_loaded()
        h, w = rgb.shape[:2]
        if self._backend == "ultralytics-sam2" and self._predictor is not None:
            try:
                return self._predict_sam2(rgb, image_type)
            except Exception as exc:
                logger.warning("SAM2 predict failed (%s) — OpenCV prior", exc)
                self._error = str(exc)

        return self._opencv_prior(rgb, image_type)

    def _predict_sam2(self, rgb: np.ndarray, image_type: str) -> np.ndarray:
        h, w = rgb.shape[:2]
        # Centered subject box — tighter for portraits/passport, wider for cars/products
        if image_type in {"human", "passport"}:
            box = [int(w * 0.18), int(h * 0.08), int(w * 0.82), int(h * 0.98)]
        elif image_type in {"vehicle", "graphic"}:
            box = [int(w * 0.05), int(h * 0.25), int(w * 0.95), int(h * 0.98)]
        elif image_type in {"signature", "logo"}:
            box = [int(w * 0.05), int(h * 0.05), int(w * 0.95), int(h * 0.95)]
        else:
            box = [int(w * 0.08), int(h * 0.08), int(w * 0.92), int(h * 0.92)]

        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        results = self._predictor.predict(
            source=bgr,
            bboxes=[box],
            verbose=False,
            device=self.device,
        )
        mask = None
        if results:
            r0 = results[0]
            if getattr(r0, "masks", None) is not None and r0.masks is not None:
                data = r0.masks.data
                if hasattr(data, "cpu"):
                    data = data.cpu().numpy()
                if data is not None and len(data) > 0:
                    # Largest mask by area
                    areas = [float(m.sum()) for m in data]
                    mask = data[int(np.argmax(areas))]
        if mask is None:
            return self._opencv_prior(rgb, image_type)
        mask = cv2.resize(mask.astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR)
        return np.clip(mask * 255.0, 0, 255).astype(np.uint8)

    def _opencv_prior(self, rgb: np.ndarray, image_type: str) -> np.ndarray:
        """Coarse subject prior when SAM2 is unavailable — still feeds BiRefNet."""
        h, w = rgb.shape[:2]
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        # Salient-ish: edges + center bias
        edges = cv2.Canny(blur, 60, 140)
        edges = cv2.dilate(edges, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), 1)

        yy, xx = np.mgrid[0:h, 0:w]
        if image_type in {"vehicle", "graphic"}:
            cy, cx = 0.62, 0.5
            sy, sx = 0.38, 0.42
        elif image_type in {"human", "passport"}:
            cy, cx = 0.48, 0.5
            sy, sx = 0.42, 0.32
        else:
            cy, cx = 0.5, 0.5
            sy, sx = 0.4, 0.4
        center = np.exp(-(((yy / h - cy) ** 2) / (2 * sy**2) + ((xx / w - cx) ** 2) / (2 * sx**2)))
        center = (center * 255).astype(np.float32)

        # Fast prior only — GrabCut is too slow on CPU and made UI stall at ~92%.
        # BiRefNet / rembg carries the real cutout quality.
        edge_f = edges.astype(np.float32)
        prior = np.clip(0.65 * center + 0.35 * edge_f, 0, 255).astype(np.uint8)
        prior = cv2.GaussianBlur(prior, (0, 0), 1.2)
        return prior

    def unload(self) -> None:
        with self._lock:
            self._predictor = None
            empty_cache()
