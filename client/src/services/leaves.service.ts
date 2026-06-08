import apiClient from "./api-client";
import {
  LeaveApplication,
  LeaveApprovalAction,
  LeavesResponse,
  BalanceResponse,
  PendingResponse,
} from "@/types/leave.types";

export async function applyLeave(data: LeaveApplication): Promise<{ message: string }> {
  const response = await apiClient.post("/api/leaves", data);
  return response.data;
}

export async function getLeaveHistory(status: string = "all"): Promise<LeavesResponse> {
  const response = await apiClient.get<LeavesResponse>("/api/leaves", {
    params: { status },
  });
  return response.data;
}

export async function getLeaveBalance(): Promise<BalanceResponse> {
  const response = await apiClient.get<BalanceResponse>("/api/leaves/balance");
  return response.data;
}

export async function cancelLeave(leaveId: number): Promise<{ message: string }> {
  const response = await apiClient.put(`/api/leaves/${leaveId}/cancel`);
  return response.data;
}

export async function getPendingRequests(): Promise<PendingResponse> {
  const response = await apiClient.get<PendingResponse>("/api/leaves/pending");
  return response.data;
}

export async function approveLeave(leaveId: number, data: LeaveApprovalAction): Promise<{ message: string }> {
  const response = await apiClient.put(`/api/leaves/${leaveId}/approve`, data);
  return response.data;
}

export async function rejectLeave(leaveId: number, data: LeaveApprovalAction): Promise<{ message: string }> {
  const response = await apiClient.put(`/api/leaves/${leaveId}/reject`, data);
  return response.data;
}
