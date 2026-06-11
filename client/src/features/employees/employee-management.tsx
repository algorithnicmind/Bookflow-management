"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { UserX, Edit2, AlertTriangle } from "lucide-react";

import { getEmployees, deactivateEmployee } from "@/services/employees.service";
import { Employee } from "@/types/employee.types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useRole } from "@/hooks/use-role";

import { AddEmployeeDialog } from "./add-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Role Badge ---
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { bg: string; text: string; label: string; border: string }> = {
    super_admin: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", label: "Super Admin" },
    admin: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", label: "Admin" },
    manager: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", label: "Manager" },
    employee: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", label: "Employee" },
  };
  const c = config[role] || config.employee;
  return (
    <Badge variant="outline" className={`${c.bg} ${c.border} ${c.text} font-bold rounded-lg px-2.5 py-0.5 border`}>
      {c.label}
    </Badge>
  );
}

// --- Main Component ---
export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { isSuperAdmin } = useRole();

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data.employees);
    } catch {
      toast.error("Failed to load employees.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // --- Deactivate ---
  const handleDeactivate = async (id: number) => {
    setDeletingId(id);
    setDeactivatingEmployee(null);
    try {
      await deactivateEmployee(id);
      toast.success("Employee deactivated successfully.");
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to deactivate employee.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Employee",
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {emp.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{emp.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{emp.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => <span className="font-medium text-[var(--text-secondary)]">{row.getValue("department")}</span>,
      },
      {
        accessorKey: "manager_name",
        header: "Manager",
        cell: ({ row }) => <span className="text-[var(--text-secondary)]">{row.original.manager_name || "—"}</span>,
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return (
            <Badge variant="outline" className={`font-bold rounded-lg border px-2 py-0.5 ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingEmployee(emp)}
                className="h-8 text-[var(--info)] bg-[var(--info)]/5 hover:bg-[var(--info)]/20 border-[var(--info)]/20"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
              {emp.is_active && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeactivatingEmployee(emp)}
                  disabled={deletingId === emp.id}
                  className="h-8 text-[var(--danger)] bg-[var(--danger)]/5 hover:bg-[var(--danger)]/20 border-[var(--danger)]/20 disabled:opacity-50"
                >
                  <UserX className="w-3.5 h-3.5 mr-1" />
                  {deletingId === emp.id ? "..." : "Deactivate"}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [deletingId]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Employee Management</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your organization&apos;s team members.</p>
        </div>
        <AddEmployeeDialog
          employees={employees}
          onSuccess={fetchEmployees}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="glass-card p-8 border-0">
          <LoadingSkeleton lines={6} />
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-card border-0">
          <EmptyState title="No employees found" description="No employees match your search criteria." icon="👥" />
        </div>
      ) : (
        <div className="glass-card p-6 border-0 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <DataTable
            columns={columns}
            data={employees}
            searchKey="name"
            searchPlaceholder="Search employees by name..."
          />
        </div>
      )}

      {/* Edit Employee Dialog */}
      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          employees={employees}
          onClose={() => setEditingEmployee(null)}
          onSuccess={() => { setEditingEmployee(null); fetchEmployees(); }}
        />
      )}

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={!!deactivatingEmployee}
        onOpenChange={(open) => !open && setDeactivatingEmployee(null)}
        onConfirm={() => { if (deactivatingEmployee) return handleDeactivate(deactivatingEmployee.id); }}
        title="Deactivate Employee"
        description={`Are you sure you want to deactivate ${deactivatingEmployee?.name}? They will no longer be able to access the system, but their leave history will be preserved.`}
        confirmLabel="Yes, Deactivate"
        cancelLabel="Cancel"
        variant="danger"
        icon={<AlertTriangle className="w-6 h-6" />}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
