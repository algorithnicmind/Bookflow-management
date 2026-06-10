"use client";

import { EmployeeManagement } from "@/features/employees/employee-management";
import { RoleGuard } from "@/components/guards/role-guard";

export default function EmployeesPage() {
  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]} fallback={
      <div className="glass-card p-12 text-center">
        <span className="text-5xl mb-4 block">🔒</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
        <p className="text-[var(--text-muted)]">You need Admin privileges to access this page.</p>
      </div>
    }>
      <EmployeeManagement />
    </RoleGuard>
  );
}
