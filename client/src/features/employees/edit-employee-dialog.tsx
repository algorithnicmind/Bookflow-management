"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

import { updateEmployee } from "@/services/employees.service";
import { Employee } from "@/types/employee.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-[var(--primary)]" />
            Edit Employee
          </DialogTitle>
          <p className="text-sm text-[var(--text-muted)] mt-1">{employee.email}</p>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} className="input-field" disabled={isSubmitting} />
            {form.formState.errors.name && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select disabled={isSubmitting} onValueChange={(val) => form.setValue("role", val as any)} defaultValue={form.watch("role")}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.role.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...form.register("department")} className="input-field" disabled={isSubmitting} />
              {form.formState.errors.department && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.department.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Manager (Optional)</Label>
            <Select disabled={isSubmitting} onValueChange={(val) => form.setValue("manager_id", val === "none" ? null : Number(val))} defaultValue={String(form.watch("manager_id") || "none")}>
              <SelectTrigger className="input-field">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Manager</SelectItem>
                {managers.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.name} ({m.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.manager_id && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.manager_id.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)] mt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
