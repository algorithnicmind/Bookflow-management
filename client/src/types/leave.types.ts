export type LeaveType = "casual" | "sick" | "earned" | "maternity" | "miscarriage" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveApplication {
  leave_type: LeaveType;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  reason: string;
}

export interface LeaveApprovalAction {
  comments: string;
}

export interface LeaveApproval {
  manager_name: string;
  action: string;
  comments: string | null;
  acted_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  created_at: string;
  updated_at: string;
  days?: number;
  employee_name?: string;
  department?: string;
  approval?: LeaveApproval;
}

export interface LeaveBalance {
  leave_type: string;
  total_days: number;
  used_days: number;
  remaining: number;
}

export interface LeavesResponse {
  leaves: LeaveRequest[];
}

export interface BalanceResponse {
  balances: LeaveBalance[];
  year: number;
}

export interface PendingResponse {
  pending: LeaveRequest[];
}
