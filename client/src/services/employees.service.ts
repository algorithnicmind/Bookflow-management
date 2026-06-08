import apiClient from "./api-client";
import {
  EmployeeCreate,
  EmployeeUpdate,
  EmployeesResponse,
} from "@/types/employee.types";

export async function getEmployees(search?: string): Promise<EmployeesResponse> {
  const response = await apiClient.get<EmployeesResponse>("/api/employees", {
    params: search ? { search } : {},
  });
  return response.data;
}

export async function createEmployee(data: EmployeeCreate): Promise<{ message: string }> {
  const response = await apiClient.post("/api/employees", data);
  return response.data;
}

export async function updateEmployee(id: number, data: EmployeeUpdate): Promise<{ message: string }> {
  const response = await apiClient.put(`/api/employees/${id}`, data);
  return response.data;
}

export async function deactivateEmployee(id: number): Promise<{ message: string }> {
  const response = await apiClient.delete(`/api/employees/${id}`);
  return response.data;
}
