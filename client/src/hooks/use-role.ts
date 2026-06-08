"use client";

import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types/auth.types";
import { hasRole, isManagerOrAbove, isAdminOrAbove, isSuperAdmin } from "@/constants/roles";

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  return {
    role,
    user,
    is: (requiredRoles: UserRole[]) => role ? hasRole(role, requiredRoles) : false,
    isManager: role ? isManagerOrAbove(role) : false,
    isAdmin: role ? isAdminOrAbove(role) : false,
    isSuperAdmin: role ? isSuperAdmin(role) : false,
    isEmployee: role === "employee",
  };
}
