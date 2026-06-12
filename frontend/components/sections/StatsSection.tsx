"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Images, Users, Star, Zap } from "lucide-react";
import { STATS } from "@/lib/constants";
import { SectionShell } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerGridItem } from "@/components/ui/motion";

const ICONS = {
  images: Images,
  users: Users,
  star: Star,
  zap: Zap,
} as const;

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
    const duration = 2000;
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
    <span ref={ref} className="text-4xl font-extrabold text-white sm:text-5xl">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <SectionShell ariaLabel="Platform statistics" className="relative overflow-hidden bg-brand-navy py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(29,78,216,0.2),transparent_70%)]" />
      <StaggerGrid className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = ICONS[s.icon];
          return (
            <StaggerGridItem key={s.label} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-brand-accent">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <Counter
                end={s.value}
                suffix={s.suffix}
                prefix={"prefix" in s ? s.prefix : ""}
                decimals={"decimals" in s ? s.decimals : 0}
              />
              <p className="mt-2 text-sm font-medium text-white/80">{s.label}</p>
            </StaggerGridItem>
          );
        })}
      </StaggerGrid>
    </SectionShell>
  );
}
