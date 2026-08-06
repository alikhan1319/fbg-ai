"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Eraser, Paintbrush, RotateCcw, Square, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type WatermarkMaskEditorHandle = {
  hasMask: () => boolean;
  exportMaskBlob: () => Promise<Blob>;
  clearMask: () => void;
};

type ToolMode = "brush" | "eraser" | "rectangle";

type Props = {
  imageUrl: string;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

/** Visible image area when CSS object-contain letterboxes the element. */
function getRenderedImageRect(img: HTMLImageElement) {
  const rect = img.getBoundingClientRect();
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh || rect.width <= 0 || rect.height <= 0) {
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }

  const elemAspect = rect.width / rect.height;
  const imgAspect = nw / nh;

  let width: number;
  let height: number;
  let offsetX: number;
  let offsetY: number;

  if (imgAspect > elemAspect) {
    width = rect.width;
    height = rect.width / imgAspect;
    offsetX = 0;
    offsetY = (rect.height - height) / 2;
  } else {
    height = rect.height;
    width = rect.height * imgAspect;
    offsetX = (rect.width - width) / 2;
    offsetY = 0;
  }

  return {
    left: rect.left + offsetX,
    top: rect.top + offsetY,
    width,
    height,
  };
}

export const WatermarkMaskEditor = forwardRef<WatermarkMaskEditorHandle, Props>(
  function WatermarkMaskEditor({ imageUrl, className }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [brushSize, setBrushSize] = useState(22);
    const [mode, setMode] = useState<ToolMode>("brush");
    const [hasPaint, setHasPaint] = useState(false);
    const [ready, setReady] = useState(false);
    const [canvasBox, setCanvasBox] = useState({ width: 0, height: 0, top: 0, left: 0 });

    const drawingRef = useRef(false);
    const rectStartRef = useRef<{ x: number; y: number } | null>(null);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const strokePathRef = useRef<{ x: number; y: number }[]>([]);

    const updateCanvasBox = useCallback(() => {
      const img = imgRef.current;
      const wrap = wrapRef.current;
      if (!img || !wrap || !img.naturalWidth) return;

      const content = getRenderedImageRect(img);
      const wrapRect = wrap.getBoundingClientRect();
      setCanvasBox({
        width: Math.round(content.width),
        height: Math.round(content.height),
        top: Math.round(content.top - wrapRect.top),
        left: Math.round(content.left - wrapRect.left),
      });
    }, []);

    const syncOverlayFromMask = useCallback(() => {
      const overlay = overlayCanvasRef.current;
      const mask = maskCanvasRef.current;
      if (!overlay || !mask || canvasBox.width < 1) return;

      overlay.width = canvasBox.width;
      overlay.height = canvasBox.height;

      const ctx = overlay.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, overlay.width, overlay.height);
      ctx.drawImage(mask, 0, 0, overlay.width, overlay.height);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = "rgba(255, 72, 72, 0.65)";
      ctx.fillRect(0, 0, overlay.width, overlay.height);
      ctx.globalCompositeOperation = "source-over";
    }, [canvasBox.height, canvasBox.width]);

    const initMaskCanvas = useCallback(() => {
      const img = imgRef.current;
      if (!img?.naturalWidth) return;

      const mask = document.createElement("canvas");
      mask.width = img.naturalWidth;
      mask.height = img.naturalHeight;
      const ctx = mask.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.clearRect(0, 0, mask.width, mask.height);
      }
      maskCanvasRef.current = mask;
      setHasPaint(false);
      setReady(true);
      updateCanvasBox();
    }, [updateCanvasBox]);

    const scanMaskHasPaint = useCallback(() => {
      const mask = maskCanvasRef.current;
      if (!mask) return false;
      const ctx = mask.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;
      const { width, height } = mask;
      const data = ctx.getImageData(0, 0, width, height).data;
      const step = Math.max(4, Math.floor((width * height) / 120_000)) * 4;
      for (let i = 0; i < data.length; i += step) {
        if (data[i] > 127 || data[i + 1] > 127 || data[i + 2] > 127) return true;
      }
      return false;
    }, []);

    const clientToMask = useCallback((clientX: number, clientY: number) => {
      const img = imgRef.current;
      const mask = maskCanvasRef.current;
      if (!img || !mask) return null;

      const content = getRenderedImageRect(img);
      if (
        clientX < content.left ||
        clientX > content.left + content.width ||
        clientY < content.top ||
        clientY > content.top + content.height
      ) {
        return null;
      }

      const x = ((clientX - content.left) / content.width) * mask.width;
      const y = ((clientY - content.top) / content.height) * mask.height;
      return {
        x: clamp(x, 0, mask.width - 1),
        y: clamp(y, 0, mask.height - 1),
      };
    }, []);

    const paintDot = useCallback(
      (x: number, y: number) => {
        const mask = maskCanvasRef.current;
        if (!mask) return;
        const ctx = mask.getContext("2d");
        if (!ctx) return;

        const scale = mask.width / canvasBox.width;
        const r = (brushSize * scale) / 2;

        ctx.save();
        if (mode === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "rgba(255,255,255,1)";
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      [brushSize, canvasBox.width, mode]
    );

    const paintStroke = useCallback(
      (from: { x: number; y: number }, to: { x: number; y: number }) => {
        const mask = maskCanvasRef.current;
        if (!mask) return;
        const ctx = mask.getContext("2d");
        if (!ctx) return;

        const scale = mask.width / canvasBox.width;
        const lineW = brushSize * scale;

        ctx.save();
        if (mode === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = "rgba(255,255,255,1)";
        }
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = lineW;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.restore();
      },
      [brushSize, canvasBox.width, mode]
    );

    const drawRectangle = useCallback(
      (x1: number, y1: number, x2: number, y2: number, preview = false) => {
        const mask = maskCanvasRef.current;
        if (!mask) return;
        const ctx = mask.getContext("2d");
        if (!ctx) return;

        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        if (w < 2 || h < 2) return;

        if (preview) {
          syncOverlayFromMask();
          const overlay = overlayCanvasRef.current;
          if (!overlay) return;
          const octx = overlay.getContext("2d");
          if (!octx) return;
          const sx = (left / mask.width) * overlay.width;
          const sy = (top / mask.height) * overlay.height;
          const sw = (w / mask.width) * overlay.width;
          const sh = (h / mask.height) * overlay.height;
          octx.save();
          octx.strokeStyle = "rgba(255, 72, 72, 0.95)";
          octx.lineWidth = 2;
          octx.setLineDash([6, 4]);
          octx.strokeRect(sx, sy, sw, sh);
          octx.restore();
          return;
        }

        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(left, top, w, h);
        ctx.restore();
      },
      [syncOverlayFromMask]
    );

    useEffect(() => {
      setReady(false);
      maskCanvasRef.current = null;
    }, [imageUrl]);

    useEffect(() => {
      if (!ready) return;
      updateCanvasBox();
      syncOverlayFromMask();
      const img = imgRef.current;
      const wrap = wrapRef.current;
      if (!img || !wrap) return;

      const ro = new ResizeObserver(() => {
        updateCanvasBox();
        syncOverlayFromMask();
      });
      ro.observe(img);
      ro.observe(wrap);
      window.addEventListener("resize", updateCanvasBox);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", updateCanvasBox);
      };
    }, [ready, updateCanvasBox, syncOverlayFromMask]);

    useEffect(() => {
      if (ready) syncOverlayFromMask();
    }, [canvasBox, ready, syncOverlayFromMask]);

    const onPointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      const pt = clientToMask(e.clientX, e.clientY);
      if (!pt) return;

      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      drawingRef.current = true;

      if (mode === "rectangle") {
        rectStartRef.current = pt;
        return;
      }

      lastPointRef.current = pt;
      strokePathRef.current = [pt];
      paintDot(pt.x, pt.y);
      syncOverlayFromMask();
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      const pt = clientToMask(e.clientX, e.clientY);
      if (!pt) return;

      if (mode === "rectangle" && rectStartRef.current) {
        syncOverlayFromMask();
        drawRectangle(rectStartRef.current.x, rectStartRef.current.y, pt.x, pt.y, true);
        return;
      }

      const last = lastPointRef.current;
      if (!last) {
        lastPointRef.current = pt;
        paintDot(pt.x, pt.y);
        syncOverlayFromMask();
        return;
      }

      paintStroke(last, pt);
      lastPointRef.current = pt;
      strokePathRef.current.push(pt);
      syncOverlayFromMask();
    };

    const onPointerUp = (e: React.PointerEvent) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;

      if (mode === "rectangle" && rectStartRef.current) {
        const pt = clientToMask(e.clientX, e.clientY);
        if (pt) {
          drawRectangle(rectStartRef.current.x, rectStartRef.current.y, pt.x, pt.y, false);
        }
        rectStartRef.current = null;
      }

      lastPointRef.current = null;
      strokePathRef.current = [];
      setHasPaint(scanMaskHasPaint());
      syncOverlayFromMask();
    };

    const clearMask = useCallback(() => {
      const mask = maskCanvasRef.current;
      if (!mask) return;
      const ctx = mask.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, mask.width, mask.height);
      setHasPaint(false);
      syncOverlayFromMask();
    }, [syncOverlayFromMask]);

    useImperativeHandle(
      ref,
      () => ({
        hasMask: () => hasPaint,
        clearMask,
        exportMaskBlob: () =>
          new Promise<Blob>((resolve, reject) => {
            const mask = maskCanvasRef.current;
            if (!mask || !hasPaint) {
              reject(new Error("Paint or box-select the watermark area first."));
              return;
            }

            const mctx = mask.getContext("2d", { willReadFrequently: true });
            if (!mctx) {
              reject(new Error("Could not export mask."));
              return;
            }

            const src = mctx.getImageData(0, 0, mask.width, mask.height);
            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = mask.width;
            exportCanvas.height = mask.height;
            const ectx = exportCanvas.getContext("2d");
            if (!ectx) {
              reject(new Error("Could not export mask."));
              return;
            }

            const out = ectx.createImageData(mask.width, mask.height);
            for (let i = 0; i < src.data.length; i += 4) {
              const painted =
                src.data[i] > 127 || src.data[i + 1] > 127 || src.data[i + 2] > 127;
              const v = painted ? 255 : 0;
              out.data[i] = v;
              out.data[i + 1] = v;
              out.data[i + 2] = v;
              out.data[i + 3] = 255;
            }
            ectx.putImageData(out, 0, 0);

            exportCanvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Could not export mask."));
              },
              "image/png"
            );
          }),
      }),
      [clearMask, hasPaint]
    );

    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={mode === "brush" ? "primary" : "outline"}
            className={cn("min-h-[36px] px-3 py-2 text-xs", mode === "brush" && "bg-brand-secondary text-white")}
            onClick={() => setMode("brush")}
          >
            <Paintbrush className="mr-1.5 h-4 w-4" />
            Brush
          </Button>
          <Button
            type="button"
            variant={mode === "rectangle" ? "primary" : "outline"}
            className={cn("min-h-[36px] px-3 py-2 text-xs", mode === "rectangle" && "bg-brand-secondary text-white")}
            onClick={() => setMode("rectangle")}
          >
            <Square className="mr-1.5 h-4 w-4" />
            Box select
          </Button>
          <Button
            type="button"
            variant={mode === "eraser" ? "primary" : "outline"}
            className="min-h-[36px] px-3 py-2 text-xs"
            onClick={() => setMode("eraser")}
          >
            <Eraser className="mr-1.5 h-4 w-4" />
            Eraser
          </Button>
          <Button type="button" variant="outline" className="min-h-[36px] px-3 py-2 text-xs" onClick={clearMask}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          {mode !== "rectangle" && (
            <div className="ml-auto flex items-center gap-2 text-xs text-brand-muted">
              <ZoomOut className="h-3.5 w-3.5" aria-hidden />
              <input
                type="range"
                min={6}
                max={64}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-28 accent-brand-secondary"
                aria-label="Brush size"
              />
              <ZoomIn className="h-3.5 w-3.5" aria-hidden />
              <span className="w-8 font-medium text-brand-text">{brushSize}</span>
            </div>
          )}
        </div>

        <div
          ref={wrapRef}
          className="relative flex justify-center overflow-hidden rounded-2xl border border-brand-border bg-gray-900/5 p-2 shadow-inner sm:p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Mark the watermark to remove"
            className="block max-h-[min(70vh,640px)] max-w-full select-none object-contain"
            onLoad={initMaskCanvas}
            draggable={false}
          />
          {ready && canvasBox.width > 0 && (
            <canvas
              ref={overlayCanvasRef}
              className="absolute touch-none"
              style={{
                width: canvasBox.width,
                height: canvasBox.height,
                top: canvasBox.top,
                left: canvasBox.left,
                cursor: mode === "rectangle" ? "crosshair" : "crosshair",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          )}
          {!hasPaint && ready && (
            <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
              <span className="rounded-full bg-black/70 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
                Brush or box-select only the watermark — not the whole photo
              </span>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-brand-muted">
          Red highlight = pixels that will be removed. Everything else stays exactly the same.
        </p>
      </div>
    );
  }
);
