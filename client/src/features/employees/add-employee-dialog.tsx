"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserPlus, User, Mail, Lock, Building, ShieldCheck, Users } from "lucide-react";

import { createEmployee } from "@/services/employees.service";
import { Employee } from "@/types/employee.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["employee", "manager", "admin", "super_admin"]),
  department: z.string().min(1, "Department is required"),
  manager_id: z.any().transform(val => val === "none" || val === "" || val === undefined ? null : Number(val)),
});

type CreateEmployeeValues = z.infer<typeof createEmployeeSchema>;

export function AddEmployeeDialog({
  employees,
  onSuccess,
  isSuperAdmin,
}: {
  employees: Employee[];
  onSuccess: () => void;
  isSuperAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateEmployeeValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { name: "", email: "", password: "", role: "employee", department: "", manager_id: "none" as any },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: CreateEmployeeValues) => {
    setIsSubmitting(true);
    try {
      await createEmployee(data as any);
      toast.success("Employee created successfully!");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const managers = employees.filter((e) => ["manager", "admin", "super_admin"].includes(e.role) && e.is_active);

  return (
    <>
      <button 
        onClick={() => setOpen(true)} 
        className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/25 text-sm"
      >
        <UserPlus className="w-4 h-4" />
        Add Employee
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0B0F19] border-slate-800 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="h-1.5 w-full bg-indigo-500" />
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-white">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                Add New Employee
              </DialogTitle>
              <DialogDescription className="text-white/50 text-sm mt-2">
                Create a new account and assign roles and departments.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input 
                  {...form.register("name")} 
                  className="w-full bg-[#111827] border border-slate-800 rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="John Doe" 
                  disabled={isSubmitting} 
                />
                {form.formState.errors.name && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                  type="email" 
                  {...form.register("email")} 
                  className="w-full bg-[#111827] border border-slate-800 rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="john@company.com" 
                  disabled={isSubmitting} 
                />
                {form.formState.errors.email && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Password
                </label>
                <input 
                  type="password" 
                  {...form.register("password")} 
                  className="w-full bg-[#111827] border border-slate-800 rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                  placeholder="••••••••" 
                  disabled={isSubmitting} 
                />
                {form.formState.errors.password && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.password.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Role
                  </label>
                  <select 
                    disabled={isSubmitting} 
                    {...form.register("role")}
                    className="w-full bg-[#111827] border border-slate-800 rounded-lg px-4 py-3 text-[14px] text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="employee" className="bg-[#0d0e18]">Employee</option>
                    <option value="manager" className="bg-[#0d0e18]">Manager</option>
                    {isSuperAdmin && <option value="admin" className="bg-[#0d0e18]">Admin</option>}
                  </select>
                  {form.formState.errors.role && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.role.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                    <Building className="w-3 h-3" /> Department
                  </label>
                  <input 
                    {...form.register("department")} 
                    className="w-full bg-[#111827] border border-slate-800 rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                    placeholder="Engineering" 
                    disabled={isSubmitting} 
                  />
                  {form.formState.errors.department && <p className="text-rose-400 text-xs font-semibold mt-1">{form.formState.errors.department.message}</p>}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Manager <span className="text-white/30 ml-1 normal-case tracking-normal">(Optional)</span>
                </label>
                <select 
                  disabled={isSubmitting} 
                  {...form.register("manager_id")}
                  className="w-full bg-[#111827] border border-slate-800 rounded-lg px-4 py-3 text-[14px] text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
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

              <DialogFooter className="mt-8 gap-3 sm:gap-0 pt-6 border-t border-slate-800/50">
                <button 
                  type="button"
                  onClick={() => setOpen(false)} 
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
                      Creating...
                    </span>
                  ) : "Create Employee"}
                </button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
