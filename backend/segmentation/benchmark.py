"""Benchmark / phase timing helpers."""

from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from dataclasses import dataclass, field

from .device import peak_vram_mb, reset_peak_vram

logger = logging.getLogger("fbr-ai.seg.bench")


@dataclass
class PhaseTimer:
    enabled: bool = True
    phases: dict[str, float] = field(default_factory=dict)

    @contextmanager
    def track(self, name: str):
        if not self.enabled:
            yield
            return
        t0 = time.perf_counter()
        try:
            yield
        finally:
            self.phases[name] = round((time.perf_counter() - t0) * 1000, 1)

    def log(self, extra: str = "") -> None:
        if not self.enabled:
            return
        parts = [f"{k}={v}ms" for k, v in self.phases.items()]
        vram = peak_vram_mb()
        vram_s = f" peak_vram={vram:.0f}MB" if vram is not None else ""
        logger.info("seg_bench %s%s %s", " ".join(parts), vram_s, extra)


def new_timer(enabled: bool = True) -> PhaseTimer:
    if enabled:
        reset_peak_vram()
    return PhaseTimer(enabled=enabled)
