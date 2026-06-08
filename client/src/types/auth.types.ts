export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export type UserRole = "super_admin" | "admin" | "manager" | "employee";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}
