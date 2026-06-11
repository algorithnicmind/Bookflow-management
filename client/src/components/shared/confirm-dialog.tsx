"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
    btn: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500",
    glow: "shadow-rose-500/20",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    btn: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
    glow: "shadow-amber-500/20",
  },
  info: {
    icon: Info,
    gradient: "from-indigo-500 to-purple-600",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    btn: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500",
    glow: "shadow-indigo-500/20",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  isLoading: externalLoading,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;
  const config = variantConfig[variant];
  const IconEl = icon ?? <config.icon className="w-6 h-6" />;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isLoading && onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={cn(
              "relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl",
              "bg-[var(--bg-secondary)]/80 backdrop-blur-2xl border-[var(--glass-border)]"
            )}
          >
            <button
              onClick={() => !isLoading && onOpenChange(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ring-1",
                config.bg, config.border
              )}>
                <span className={config.text}>{IconEl}</span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs">{description}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={async () => {
                  setInternalLoading(true);
                  try {
                    await onConfirm();
                  } finally {
                    setInternalLoading(false);
                  }
                }}
                disabled={isLoading}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50",
                  config.btn, config.glow
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
