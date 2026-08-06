"""BiRefNet saliency — primary cutout engine (CUDA FP16 / CPU FP32).

Tries HuggingFace transformers first; falls back to rembg BiRefNet session
when transformers/torch are incompatible (e.g. torch 2.1 + transformers 5.x).
"""
from __future__ import annotations

import logging
import os
import threading
from typing import Any, Optional

import cv2
import numpy as np
from PIL import Image

from .device import empty_cache, resolve_device

logger = logging.getLogger("fbr-ai.seg.birefnet")

_MODEL_ID = os.getenv("BIREFNET_MODEL_ID", "ZhengPeng7/BiRefNet").strip() or "ZhengPeng7/BiRefNet"
_MAX_SIDE = int(os.getenv("BIREFNET_MAX_SIDE", "0")) or 0
_DISABLED = os.getenv("SEG_DISABLE_BIREFNET", "").strip().lower() in {"1", "true", "yes", "on"}


def _max_side_for_device(device: str) -> int:
    if _MAX_SIDE > 0:
        return _MAX_SIDE
    # 1024 keeps subject detail (hair, edges) without the multi-minute birefnet path
    return 1024


class BiRefNetEngine:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.device = resolve_device()
        self._hf_model: Any = None
        self._rembg_session: Any = None
        self._backend: str = "unloaded"
        self._error: Optional[str] = None

    @property
    def backend(self) -> str:
        return self._backend

    @property
    def error(self) -> Optional[str]:
        return self._error

    def ensure_loaded(self) -> None:
        if _DISABLED:
            self._backend = "disabled"
            self._error = "SEG_DISABLE_BIREFNET"
            return
        if self._hf_model is not None or self._rembg_session is not None:
            return
        with self._lock:
            if self._hf_model is not None or self._rembg_session is not None:
                return
            if self._try_transformers():
                return
            if self._try_rembg():
                return
            self._backend = "failed"
            self._error = self._error or "BiRefNet unavailable"
            logger.error("BiRefNet unavailable (transformers + rembg both failed)")

    def _try_transformers(self) -> bool:
        try:
            import torch
            from transformers import AutoModelForImageSegmentation

            logger.info(
                "Loading BiRefNet via transformers (%s) on %s …",
                _MODEL_ID,
                self.device,
            )
            model = AutoModelForImageSegmentation.from_pretrained(
                _MODEL_ID,
                trust_remote_code=True,
            )
            model.eval()
            if self.device == "cuda":
                model = model.to("cuda")
                try:
                    model = model.half()
                except Exception:
                    pass
            else:
                model = model.to("cpu")

            self._hf_model = model
            self._backend = f"birefnet-hf:{_MODEL_ID.split('/')[-1]}"
            self._error = None
            logger.info("BiRefNet transformers ready (%s)", self._backend)
            return True
        except Exception as exc:
            logger.warning("BiRefNet transformers load failed: %s", exc)
            self._hf_model = None
            self._error = str(exc)
            return False

    def _try_rembg(self) -> bool:
        try:
            from rembg import new_session

            # CPU: isnet finishes in ~10–20s; birefnet-general often 2–3+ min and stalls the UI.
            forced = (os.getenv("BIREFNET_REMBG_MODEL") or "").strip()
            if forced:
                model_name = forced
            elif self.device == "cpu":
                model_name = "isnet-general-use"
            else:
                model_name = "birefnet-general"

            logger.info("Loading rembg cutout session (%s) …", model_name)
            self._rembg_session = new_session(model_name)
            self._backend = f"rembg:{model_name}"
            self._error = None
            logger.info("rembg cutout ready (%s)", self._backend)
            return True
        except Exception as exc:
            logger.warning("rembg cutout fallback failed: %s", exc)
            self._rembg_session = None
            self._error = str(exc)
            return False

    def refine_mask(self, rgb: np.ndarray, prior_mask: np.ndarray | None = None) -> np.ndarray:
        """
        Return uint8 alpha HxW. Uses BiRefNet prediction; gently blends SAM2/OpenCV prior.
        """
        self.ensure_loaded()
        h, w = rgb.shape[:2]
        if self._backend in {"disabled", "failed", "unloaded"}:
            if prior_mask is not None and prior_mask.shape[:2] == (h, w):
                return prior_mask.astype(np.uint8)
            return np.zeros((h, w), dtype=np.uint8)

        if self._rembg_session is not None:
            alpha = self._predict_rembg(rgb)
        else:
            alpha = self._predict_hf(rgb)

        # Only blend a real SAM2 prior — OpenCV prior softens BG into dark leftovers.
        if (
            prior_mask is not None
            and prior_mask.shape[:2] == (h, w)
            and self._hf_model is not None
        ):
            p = prior_mask.astype(np.float32) / 255.0
            a = alpha.astype(np.float32) / 255.0
            blended = np.clip(0.85 * a + 0.15 * p, 0.0, 1.0)
            blended = np.where(a >= 0.90, a, blended)
            blended = np.where(a <= 0.10, a, blended)
            alpha = (blended * 255.0).astype(np.uint8)

        empty_cache()
        return alpha

    def _predict_rembg(self, rgb: np.ndarray) -> np.ndarray:
        from rembg import remove

        h, w = rgb.shape[:2]
        max_side = max(1, _max_side_for_device(self.device))
        scale = min(1.0, float(max_side) / float(max(h, w)))
        work = rgb
        if scale < 1.0:
            work = cv2.resize(
                rgb,
                (max(1, int(round(w * scale))), max(1, int(round(h * scale)))),
                interpolation=cv2.INTER_AREA,
            )
        rgba = remove(
            Image.fromarray(work).convert("RGBA"),
            session=self._rembg_session,
            only_mask=False,
            post_process_mask=True,
        )
        if not isinstance(rgba, Image.Image):
            rgba = Image.fromarray(np.asarray(rgba))
        alpha = np.asarray(rgba.convert("RGBA"))[:, :, 3]
        if scale < 1.0:
            alpha = cv2.resize(alpha, (w, h), interpolation=cv2.INTER_LINEAR)
        return alpha

    def _predict_hf(self, rgb: np.ndarray) -> np.ndarray:
        import torch
        from torchvision import transforms

        h, w = rgb.shape[:2]
        max_side = max(1, _max_side_for_device(self.device))
        side = min(max_side, 1024)
        transform = transforms.Compose(
            [
                transforms.Resize((side, side)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ]
        )
        pil = Image.fromarray(rgb).convert("RGB")
        tensor = transform(pil).unsqueeze(0)
        dtype = torch.float16 if self.device == "cuda" else torch.float32
        tensor = tensor.to(device=self.device, dtype=dtype)

        with torch.no_grad():
            preds = self._hf_model(tensor)
            if isinstance(preds, (list, tuple)):
                pred = preds[-1]
            else:
                pred = preds
            if isinstance(pred, (list, tuple)):
                pred = pred[-1]
            mask = pred.sigmoid().float().cpu().numpy()
        if mask.ndim == 4:
            mask = mask[0, 0]
        elif mask.ndim == 3:
            mask = mask[0]
        alpha = (np.clip(mask, 0, 1) * 255.0).astype(np.uint8)
        return cv2.resize(alpha, (w, h), interpolation=cv2.INTER_LINEAR)

    def unload(self) -> None:
        with self._lock:
            self._hf_model = None
            self._rembg_session = None
            self._backend = "unloaded"
            empty_cache()
