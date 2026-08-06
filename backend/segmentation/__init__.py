"""Modern segmentation stack: SAM2 → BiRefNet → PyMatting (CUDA-aware)."""

from .pipeline import SegmentationPipeline, get_pipeline

__all__ = ["SegmentationPipeline", "get_pipeline"]
