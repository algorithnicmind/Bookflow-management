import { UserRole } from "@/types/auth.types";

export const ROLES = {
  SUPER_ADMIN: "super_admin" as UserRole,
  ADMIN: "admin" as UserRole,
  MANAGER: "manager" as UserRole,
  EMPLOYEE: "employee" as UserRole,
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};

export const ROLE_HIERARCHY: UserRole[] = [
  "super_admin",
  "admin",
  "manager",
  "employee",
];

/** Check if a role has at least the minimum required privilege level */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

/** Check if a role is at manager level or above */
export function isManagerOrAbove(role: UserRole): boolean {
  return hasRole(role, ["super_admin", "admin", "manager"]);
}

/** Check if a role is at admin level or above */
export function isAdminOrAbove(role: UserRole): boolean {
  return hasRole(role, ["super_admin", "admin"]);
}

/** Check if a role is super admin */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}
