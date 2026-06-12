"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareSliderProps {
  before: string;
  after: string;
  altBefore: string;
  altAfter: string;
  className?: string;
  /** Show the whole image (default) or crop to fill the frame. */
  imageFit?: "contain" | "cover";
  /** Tailwind aspect ratio class, e.g. aspect-[4/5]. Matches each example so contain shows the full photo. */
  aspectClass?: string;
  transparentAfter?: boolean;
  useNativeImage?: boolean;
}

export function CompareSlider({
  before,
  after,
  altBefore,
  altAfter,
  className,
  imageFit = "contain",
  aspectClass = "aspect-[4/5] sm:aspect-[3/4]",
  transparentAfter = false,
  useNativeImage = false,
}: CompareSliderProps) {
  const objectClass =
    imageFit === "cover" ? "object-cover object-center" : "object-contain object-center";
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - r.left, 0), r.width);
    setPos((x / r.width) * 100);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    update(e.clientX);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    update(e.clientX);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative cursor-ew-resize select-none overflow-hidden rounded-2xl bg-brand-card shadow-lg",
        aspectClass,
        className
      )}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        setDragging(true);
        update(e.clientX);
      }}
      onPointerMove={onMove}
      onPointerUp={() => setDragging(false)}
      onPointerLeave={() => setDragging(false)}
    >
      <div className="absolute inset-0">
        {useNativeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={before} alt={altBefore} className={cn("h-full w-full", objectClass)} loading="lazy" />
        ) : (
          <Image src={before} alt={altBefore} fill className={objectClass} sizes="400px" loading="lazy" />
        )}
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white">
          Before
        </span>
      </div>

      <div
        className={cn("absolute inset-0", transparentAfter && "checkerboard")}
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      >
        {useNativeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={after} alt={altAfter} className={cn("h-full w-full", objectClass)} loading="lazy" />
        ) : (
          <Image src={after} alt={altAfter} fill className={objectClass} sizes="400px" loading="lazy" />
        )}
        <span className="absolute bottom-3 right-3 rounded-md bg-brand-primary px-2 py-1 text-xs font-semibold text-white">
          After
        </span>
      </div>

      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-md"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            onDown(e);
          }}
          className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-brand-primary to-brand-secondary shadow-xl shadow-brand-primary/40 transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Drag to compare before and after"
        >
          <ArrowLeftRight className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
