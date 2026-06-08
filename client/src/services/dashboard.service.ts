import apiClient from "./api-client";
import { DashboardResponse } from "@/types/dashboard.types";

export async function getDashboardStats(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>("/api/dashboard/stats");
  return response.data;
}
