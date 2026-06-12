"use client";
import {
  Eraser,
  Maximize2,
  ImagePlus,
  Stamp,
  Droplets,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { AI_TOOLS } from "@/lib/constants";
import { SectionHeading, SectionShell } from "@/components/ui/SectionHeading";
import { StaggerGrid, StaggerGridItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

const icons = {
  eraser: Eraser,
  maximize: Maximize2,
  "image-plus": ImagePlus,
  stamp: Stamp,
  droplets: Droplets,
  sparkles: Sparkles,
} as const;

export function ToolsGridSection() {
  return (
    <SectionShell id="tools" className="bg-brand-card/50" ariaLabel="AI image editing tools">
      <div className="section-divider absolute inset-x-0 top-0" />
      <SectionHeading
        label="All-in-one platform"
        title="Six powerful"
        highlight="AI tools"
        description="Start with our free background remover AI, then upscale, enhance, blur, remove watermarks, or generate new scenes — six tools in one place."
      />

      <StaggerGrid className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {AI_TOOLS.map((tool) => {
          const Icon = icons[tool.icon as keyof typeof icons];
          const isPrimary = tool.id === "remove-bg";
          return (
            <StaggerGridItem key={tool.id}>
              <motion.article
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "tool-card group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-8 transition-all duration-300",
                  isPrimary && "ring-2 ring-brand-secondary/20"
                )}
              >
                <Link
                  href={tool.route}
                  id={tool.id}
                  className="block w-full text-left"
                >
                  {isPrimary && (
                    <span className="mb-5 inline-flex rounded-full bg-linear-to-r from-brand-secondary to-brand-purple px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      Most Popular
                    </span>
                  )}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-secondary/15 to-brand-purple/15 transition-all duration-300 group-hover:from-brand-secondary group-hover:to-brand-purple group-hover:shadow-lg">
                    <Icon className="h-7 w-7 text-brand-secondary transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-brand-text">{tool.fullName}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted/80">{tool.description}</p>
                  <span className="mt-6 flex translate-y-2 items-center gap-1 text-sm font-semibold text-brand-secondary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Try now <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.article>
            </StaggerGridItem>
          );
        })}
      </StaggerGrid>
    </SectionShell>
  );
}
