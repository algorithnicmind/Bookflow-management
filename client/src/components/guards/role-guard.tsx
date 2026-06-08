"use client";

import { ReactNode } from "react";
import { useRole } from "@/hooks/use-role";
import { UserRole } from "@/types/auth.types";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard — renders children only if the current user has an allowed role.
 * Use this to gate sections of UI (not pages — use middleware for page-level gating).
 */
export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { is } = useRole();

  if (!is(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
