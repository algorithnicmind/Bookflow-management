"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { getEmployees, createEmployee, updateEmployee, deactivateEmployee } from "@/services/employees.service";
import { Employee } from "@/types/employee.types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useRole } from "@/hooks/use-role";

// --- Schemas ---
const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["employee", "manager", "admin", "super_admin"]),
  department: z.string().min(1, "Department is required"),
  manager_id: z.any().transform(val => val === "" || val === undefined ? null : Number(val)),
});

const editEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["employee", "manager", "admin", "super_admin"]),
  department: z.string().min(1, "Department is required"),
  manager_id: z.any().transform(val => val === "" || val === undefined ? null : Number(val)),
});

type CreateEmployeeValues = z.infer<typeof createEmployeeSchema>;
type EditEmployeeValues = z.infer<typeof editEmployeeSchema>;

// --- Role Badge ---
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    super_admin: { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400", label: "Super Admin" },
    admin: { bg: "bg-indigo-500/10 border-indigo-500/20", text: "text-indigo-400", label: "Admin" },
    manager: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", label: "Manager" },
    employee: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", label: "Employee" },
  };
  const c = config[role] || config.employee;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// --- Main Component ---
export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { isSuperAdmin } = useRole();

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees(search || undefined);
      setEmployees(data.employees);
    } catch {
      toast.error("Failed to load employees.");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(), 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // --- Deactivate ---
  const handleDeactivate = async (id: number) => {
    setDeletingId(id);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Employee Management</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage your organization's team members.</p>
        </div>
        <button onClick={() => setShowAddDialog(true)} className="btn-primary shrink-0">
          + Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input-field max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8"><LoadingSkeleton lines={6} /></div>
        ) : employees.length === 0 ? (
          <EmptyState title="No employees found" description="No employees match your search criteria." icon="👥" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-secondary)]/50">
                <tr>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Employee</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Role</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Department</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Manager</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Status</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {employees.map((emp, i) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group hover:bg-[var(--primary)]/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{emp.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={emp.role} /></td>
                    <td className="px-6 py-4 font-medium text-[var(--text-secondary)]">{emp.department}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{emp.manager_name || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${
                        emp.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="text-xs font-bold text-[var(--info)] bg-[var(--info)]/10 hover:bg-[var(--info)]/20 border border-[var(--info)]/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {emp.is_active && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to deactivate ${emp.name}?`)) {
                                handleDeactivate(emp.id);
                              }
                            }}
                            disabled={deletingId === emp.id}
                            className="text-xs font-bold text-[var(--danger)] bg-[var(--danger)]/5 hover:bg-[var(--danger)]/15 border border-[var(--danger)]/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deletingId === emp.id ? "..." : "Deactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Dialog */}
      {showAddDialog && (
        <AddEmployeeDialog
          employees={employees}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => { setShowAddDialog(false); fetchEmployees(); }}
          isSuperAdmin={isSuperAdmin}
        />
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
    </div>
  );
}

// --- Add Employee Dialog ---
function AddEmployeeDialog({
  employees,
  onClose,
  onSuccess,
  isSuperAdmin,
}: {
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
  isSuperAdmin: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<CreateEmployeeValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { name: "", email: "", password: "", role: "employee", department: "", manager_id: null },
  });

  const onSubmit = async (data: CreateEmployeeValues) => {
    setIsSubmitting(true);
    try {
      await createEmployee(data);
      toast.success("Employee created successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const managers = employees.filter((e) => ["manager", "admin", "super_admin"].includes(e.role) && e.is_active);

  return (
    <DialogOverlay onClose={onClose}>
      <h2 className="text-xl font-bold gradient-text mb-6">Add New Employee</h2>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        <FormField label="Full Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className="input-field" placeholder="John Doe" disabled={isSubmitting} />
        </FormField>
        <FormField label="Email" error={form.formState.errors.email?.message}>
          <input {...form.register("email")} type="email" className="input-field" placeholder="john@company.com" disabled={isSubmitting} />
        </FormField>
        <FormField label="Password" error={form.formState.errors.password?.message}>
          <input {...form.register("password")} type="password" className="input-field" placeholder="••••••••" disabled={isSubmitting} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <select {...form.register("role")} className="input-field" disabled={isSubmitting}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              {isSuperAdmin && <option value="admin">Admin</option>}
            </select>
          </FormField>
          <FormField label="Department" error={form.formState.errors.department?.message}>
            <input {...form.register("department")} className="input-field" placeholder="Engineering" disabled={isSubmitting} />
          </FormField>
        </div>
        <FormField label="Manager (Optional)">
          <select {...form.register("manager_id")} className="input-field" disabled={isSubmitting}>
            <option value="">No Manager</option>
            {managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.department})</option>)}
          </select>
        </FormField>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </DialogOverlay>
  );
}

// --- Edit Employee Dialog ---
function EditEmployeeDialog({
  employee,
  employees,
  onClose,
  onSuccess,
}: {
  employee: Employee;
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EditEmployeeValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      name: employee.name,
      role: employee.role,
      department: employee.department,
      manager_id: employee.manager_id,
    },
  });

  const onSubmit = async (data: EditEmployeeValues) => {
    setIsSubmitting(true);
    try {
      await updateEmployee(employee.id, data);
      toast.success("Employee updated successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const managers = employees.filter((e) => ["manager", "admin", "super_admin"].includes(e.role) && e.is_active && e.id !== employee.id);

  return (
    <DialogOverlay onClose={onClose}>
      <h2 className="text-xl font-bold gradient-text mb-6">Edit Employee</h2>
      <p className="text-sm text-[var(--text-muted)] mb-4">{employee.email}</p>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        <FormField label="Full Name" error={form.formState.errors.name?.message}>
          <input {...form.register("name")} className="input-field" disabled={isSubmitting} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Role" error={form.formState.errors.role?.message}>
            <select {...form.register("role")} className="input-field" disabled={isSubmitting}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>
          <FormField label="Department" error={form.formState.errors.department?.message}>
            <input {...form.register("department")} className="input-field" disabled={isSubmitting} />
          </FormField>
        </div>
        <FormField label="Manager (Optional)">
          <select {...form.register("manager_id")} className="input-field" disabled={isSubmitting}>
            <option value="">No Manager</option>
            {managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.department})</option>)}
          </select>
        </FormField>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </DialogOverlay>
  );
}

// --- Shared Components ---
function DialogOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{label}</label>
      {children}
      {error && <p className="text-[var(--danger)] text-xs mt-1 font-bold">{error}</p>}
    </div>
  );
}
