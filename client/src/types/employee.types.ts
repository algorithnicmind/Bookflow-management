import { UserRole } from "./auth.types";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  manager_id: number | null;
  is_active: boolean;
  created_at: string;
  manager_name: string | null;
}

export interface EmployeeCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  manager_id?: number | null;
}

export interface EmployeeUpdate {
  name?: string;
  role?: string;
  department?: string;
  manager_id?: number | null;
}

export interface EmployeesResponse {
  employees: Employee[];
}
