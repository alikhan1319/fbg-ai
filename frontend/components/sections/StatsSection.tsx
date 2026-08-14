"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { STATS } from "@/lib/constants";
import { SectionShell } from "@/components/ui/SectionHeading";
import { FadeInView } from "@/components/ui/motion";

function Counter({
  end,
  suffix,
  prefix = "",
  decimals = 0,
}: {
  end: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const duration = 1800;
    const loop = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = end * eased;
      setN(decimals > 0 ? Math.round(val * 10) / 10 : Math.floor(val));
      if (p < 1) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, decimals]);

  const display = decimals > 0 ? n.toFixed(decimals) : n.toLocaleString();

  return (
    <span ref={ref} className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
      {prefix}
      {display}
      <span className="text-brand-secondary">{suffix}</span>
    </span>
  );
}

export function StatsSection() {
  return (
    <section aria-label="Platform statistics" className="relative overflow-hidden bg-brand-navy">
      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8 sm:py-20">
        <FadeInView className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="studio-label">By the numbers</p>
          <p className="max-w-sm text-sm text-white/45 sm:text-right">
            Real usage across creators, shops, and teams shipping images daily.
          </p>
        </FadeInView>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {STATS.map((s, i) => (
            <FadeInView
              key={s.label}
              delay={i * 0.08}
              className={`flex flex-col gap-3 ${i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""} ${i < STATS.length - 1 ? "border-b border-white/10 pb-10 lg:border-b-0 lg:pb-0" : ""} sm:border-b-0 sm:pb-0`}
            >
              <Counter
                end={s.value}
                suffix={s.suffix}
                prefix={"prefix" in s ? s.prefix : ""}
                decimals={"decimals" in s ? s.decimals : 0}
              />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                {s.label}
              </p>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
