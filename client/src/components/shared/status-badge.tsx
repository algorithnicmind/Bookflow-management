"use client";

import { cn } from "@/lib/utils";
import { LEAVE_STATUS_CONFIG } from "@/constants/leave-types";
import { LeaveStatus } from "@/types/leave.types";

interface StatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = LEAVE_STATUS_CONFIG[status] || LEAVE_STATUS_CONFIG.pending;
  const isPending = status === "pending";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border backdrop-blur-sm",
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      {isPending && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      )}
      {config.label}
    </span>
  );
}
