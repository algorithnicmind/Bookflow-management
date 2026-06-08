"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-md bg-white/5 animate-pulse"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card-static p-6 space-y-4", className)}>
      <div className="h-4 w-1/3 rounded bg-white/5 animate-pulse" />
      <div className="h-8 w-1/2 rounded bg-white/5 animate-pulse" />
      <div className="h-3 w-2/3 rounded bg-white/5 animate-pulse" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card-static p-6 space-y-4">
      <div className="h-5 w-1/4 rounded bg-white/5 animate-pulse mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 rounded bg-white/5 animate-pulse flex-1"
              style={{ animationDelay: `${(r * cols + c) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
