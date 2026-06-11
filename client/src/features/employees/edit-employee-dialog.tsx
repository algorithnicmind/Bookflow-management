"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Edit2, User, Building, ShieldCheck, Users } from "lucide-react";

import { updateEmployee } from "@/services/employees.service";
import { Employee } from "@/types/employee.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const editEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["employee", "manager", "admin", "super_admin"]),
  department: z.string().min(1, "Department is required"),
  manager_id: z.any().transform(val => val === "none" || val === "" || val === undefined ? null : Number(val)),
});

type EditEmployeeValues = z.infer<typeof editEmployeeSchema>;

export function EditEmployeeDialog({
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
      manager_id: (employee.manager_id ? String(employee.manager_id) : "none") as any,
    },
  });

  const onSubmit = async (data: EditEmployeeValues) => {
    setIsSubmitting(true);
    try {
      await updateEmployee(employee.id, data as any);
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-[var(--bg-primary)] border-[var(--border)] shadow-lg rounded-2xl p-0 overflow-hidden">
        <div className="h-1.5 w-full bg-indigo-500" />
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-white">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Edit2 className="w-5 h-5" />
              </div>
              Edit Employee
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)] text-sm mt-2">
              Editing profile for <strong className="text-white">{employee.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input 
                {...form.register("name")} 
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                disabled={isSubmitting} 
              />
              {form.formState.errors.name && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> Role
                </label>
                <select 
                  disabled={isSubmitting} 
                  {...form.register("role")}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="employee" className="bg-[#0d0e18]">Employee</option>
                  <option value="manager" className="bg-[#0d0e18]">Manager</option>
                  <option value="admin" className="bg-[#0d0e18]">Admin</option>
                </select>
                {form.formState.errors.role && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.role.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                  <Building className="w-3 h-3" /> Department
                </label>
                <input 
                  {...form.register("department")} 
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                  disabled={isSubmitting} 
                />
                {form.formState.errors.department && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.department.message}</p>}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3 h-3" /> Manager <span className="text-[var(--text-muted)] ml-1 normal-case tracking-normal">(Optional)</span>
              </label>
              <select 
                disabled={isSubmitting} 
                {...form.register("manager_id")}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="none" className="bg-[#0d0e18]">No Manager</option>
                {managers.map((m) => (
                  <option key={m.id} value={String(m.id)} className="bg-[#0d0e18]">
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
              {form.formState.errors.manager_id && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.manager_id.message}</p>}
            </div>

            <DialogFooter className="mt-8 gap-3 sm:gap-0 pt-6 border-t border-[var(--border)]/50">
              <button 
                type="button"
                onClick={onClose} 
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 font-semibold hover:bg-white/5 hover:text-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg font-bold text-[14px] shadow-lg transition-all bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
