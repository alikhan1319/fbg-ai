"""Device selection, CUDA helpers, memory hygiene."""

from __future__ import annotations

import logging
import os
from functools import lru_cache

logger = logging.getLogger("fbr-ai.seg.device")


@lru_cache(maxsize=1)
def get_torch():
    import torch

    return torch


def resolve_device(prefer: str | None = None) -> str:
    """Return 'cuda' or 'cpu'. Respects SEG_DEVICE env."""
    torch = get_torch()
    forced = (prefer or os.getenv("SEG_DEVICE") or "").strip().lower()
    if forced in {"cuda", "cpu"}:
        if forced == "cuda" and not torch.cuda.is_available():
            logger.warning("SEG_DEVICE=cuda but CUDA unavailable — using CPU")
            return "cpu"
        return forced
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def empty_cache() -> None:
    torch = get_torch()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def peak_vram_mb() -> float | None:
    torch = get_torch()
    if not torch.cuda.is_available():
        return None
    return float(torch.cuda.max_memory_allocated() / (1024 * 1024))


def reset_peak_vram() -> None:
    torch = get_torch()
    if torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats()
