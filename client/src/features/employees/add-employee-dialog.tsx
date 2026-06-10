"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

import { createEmployee } from "@/services/employees.service";
import { Employee } from "@/types/employee.types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Reset form when dialog opens
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="btn-primary shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text">Add New Employee</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} className="input-field" placeholder="John Doe" disabled={isSubmitting} />
            {form.formState.errors.name && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} className="input-field" placeholder="john@company.com" disabled={isSubmitting} />
            {form.formState.errors.email && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} className="input-field" placeholder="••••••••" disabled={isSubmitting} />
            {form.formState.errors.password && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.password.message}</p>}
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
                  {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
              {form.formState.errors.role && <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.role.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...form.register("department")} className="input-field" placeholder="Engineering" disabled={isSubmitting} />
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
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
