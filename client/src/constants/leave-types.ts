import { LeaveType } from "@/types/leave.types";

export interface LeaveTypeConfig {
  value: LeaveType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const LEAVE_TYPES: LeaveTypeConfig[] = [
  {
    value: "casual",
    label: "Casual Leave",
    icon: "🏖️",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    value: "sick",
    label: "Sick Leave",
    icon: "🏥",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  {
    value: "earned",
    label: "Earned Leave",
    icon: "📅",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    value: "unpaid",
    label: "Unpaid Leave",
    icon: "📋",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

export const LEAVE_STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  rejected: { label: "Rejected", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  cancelled: { label: "Cancelled", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
} as const;

export function getLeaveTypeConfig(type: string): LeaveTypeConfig | undefined {
  return LEAVE_TYPES.find((lt) => lt.value === type);
}

export const LEAVE_TYPE_LABELS: Record<string, string> = {
  casual: "Casual Leave",
  sick: "Sick Leave",
  earned: "Earned Leave",
  unpaid: "Unpaid Leave"
};

