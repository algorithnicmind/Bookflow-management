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

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}
