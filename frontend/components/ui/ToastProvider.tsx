"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { modalContent } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "info" | "error";

interface ToastState {
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (title: string, variant?: ToastVariant, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconWrap: string; border: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-200/80",
    bg: "bg-gradient-to-br from-white to-emerald-50/80",
  },
  info: {
    icon: Info,
    iconWrap: "bg-brand-secondary/10 text-brand-secondary",
    border: "border-brand-secondary/25",
    bg: "bg-gradient-to-br from-white to-brand-secondary/5",
  },
  error: {
    icon: AlertCircle,
    iconWrap: "bg-red-100 text-red-600",
    border: "border-red-200/80",
    bg: "bg-gradient-to-br from-white to-red-50/80",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((title: string, variant: ToastVariant = "success", description?: string) => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const Icon = toast ? VARIANT_STYLES[toast.variant].icon : CheckCircle2;
  const styles = toast ? VARIANT_STYLES[toast.variant] : VARIANT_STYLES.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast ? (
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed top-6 right-6 z-[200] flex max-w-sm gap-3 rounded-2xl border p-4 shadow-2xl shadow-brand-navy/10 backdrop-blur-md",
              styles.border,
              styles.bg
            )}
            role="status"
            aria-live="polite"
          >
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", styles.iconWrap)}>
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pr-1">
              <p className="text-sm font-bold text-brand-text">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-sm leading-relaxed text-brand-muted">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1 transition-colors duration-300 hover:bg-black/5"
            >
              <X className="h-4 w-4 text-brand-muted" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
