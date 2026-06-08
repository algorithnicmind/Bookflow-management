import apiClient from "./api-client";
import { LoginResponse } from "@/types/auth.types";

/**
 * Login using OAuth2PasswordRequestForm format.
 * Backend expects form-data with 'username' (email) and 'password'.
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await apiClient.post<LoginResponse>("/api/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
}

/**
 * Register a new admin user (Super Admin / Admin only).
 */
export async function registerAdmin(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ message: string; employee: { id: number; name: string; email: string; role: string; department: string } }> {
  const response = await apiClient.post("/api/auth/register", data);
  return response.data;
}
