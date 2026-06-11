"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { UserX, Edit2, AlertTriangle, Shield, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getEmployees, deactivateEmployee } from "@/services/employees.service";
import { Employee } from "@/types/employee.types";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useRole } from "@/hooks/use-role";
import { skeletonPulse } from "@/lib/animations";

import { AddEmployeeDialog } from "./add-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { bg: string; text: string; label: string; border: string }> = {
    super_admin: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", label: "Super Admin" },
    admin: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", label: "Admin" },
    manager: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", label: "Manager" },
    employee: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "Employee" },
  };
  const c = config[role] || config.employee;
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 ${c.bg} ${c.border} ${c.text} text-[10px] uppercase tracking-widest font-bold rounded-lg border`}>
      {c.label}
    </span>
  );
}

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
            <div className="flex items-center gap-4 py-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                {emp.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white leading-tight">{emp.name}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{emp.email}</p>
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
        cell: ({ row }) => (
          <span className="text-sm font-bold text-white/60 uppercase tracking-wider text-[11px] bg-white/5 px-2.5 py-1 rounded-lg">
            {row.getValue("department")}
          </span>
        ),
      },
      {
        accessorKey: "manager_name",
        header: "Manager",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.manager_name ? (
              <>
                <Shield className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-sm font-medium text-white/70">{row.original.manager_name}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-[var(--text-muted)]">—</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border w-fit ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}>
              {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-bold uppercase tracking-widest">{isActive ? "Active" : "Inactive"}</span>
            </div>
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
              <button
                onClick={() => setEditingEmployee(emp)}
                className="group relative inline-flex items-center justify-center w-8 h-8 rounded-lg text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                title="Edit Employee"
              >
                <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              {emp.is_active && (
                <button
                  onClick={() => setDeactivatingEmployee(emp)}
                  disabled={deletingId === emp.id}
                  className="group relative inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50"
                  title="Deactivate Employee"
                >
                  <UserX className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
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
      <div className="flex justify-end">
        <AddEmployeeDialog
          employees={employees}
          onSuccess={fetchEmployees}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-4"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div 
                  key={i} 
                  variants={skeletonPulse} 
                  initial="initial" 
                  animate="animate" 
                  className="h-16 w-full bg-white/[0.02] border border-[var(--border)] rounded-xl"
                />
              ))}
            </motion.div>
          ) : employees.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12"
            >
              <EmptyState title="No employees found" description="There are no active or inactive employees matching your criteria." icon="👥" />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <DataTable
                columns={columns}
                data={employees}
                searchKey="name"
                searchPlaceholder="Search employees by name..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          employees={employees}
          onClose={() => setEditingEmployee(null)}
          onSuccess={() => { setEditingEmployee(null); fetchEmployees(); }}
        />
      )}

      <ConfirmDialog
        open={!!deactivatingEmployee}
        onOpenChange={(open) => !open && setDeactivatingEmployee(null)}
        onConfirm={() => { if (deactivatingEmployee) return handleDeactivate(deactivatingEmployee.id); }}
        title="Deactivate Employee"
        description={`Are you sure you want to deactivate ${deactivatingEmployee?.name}? They will lose access to the system immediately.`}
        confirmLabel="Yes, Deactivate"
        cancelLabel="Cancel"
        variant="danger"
        icon={<AlertTriangle className="w-6 h-6" />}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
