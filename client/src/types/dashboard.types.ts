import { LeaveRequest, LeaveBalance } from "./leave.types";

export interface DashboardStats {
  total_requests: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface DepartmentBreakdown {
  department: string;
  count: number;
}

export interface OrgStats {
  total_employees: number;
  total_requests: number;
  department_breakdown: DepartmentBreakdown[];
}

export interface DashboardResponse {
  role: string;
  stats: DashboardStats;
  team_pending_count?: number;
  team_on_leave_today?: string[];
  org_stats?: OrgStats;
  recent_leaves: LeaveRequest[];
  balances: LeaveBalance[];
}
