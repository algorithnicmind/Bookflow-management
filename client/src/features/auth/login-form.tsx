"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth-store";
import { loginUser } from "@/services/auth.service";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await loginUser(data.email, data.password);
      login(response.access_token, response.user);
      toast.success("Login successful!");
      
      // Role-based redirect
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(
        error.response?.data?.detail || "Failed to login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">LeaveFlow</h1>
        <p className="text-text-secondary">Sign in to your account</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Email Address
          </label>
          <input
            {...form.register("email")}
            type="email"
            className="input-field"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-danger text-xs mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Password
          </label>
          <input
            {...form.register("password")}
            type="password"
            className="input-field"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-danger text-xs mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-4 flex justify-center items-center h-10"
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center text-sm text-text-muted bg-[rgba(255,255,255,0.02)] p-4 rounded-lg">
        <p className="font-semibold mb-2">Demo Credentials</p>
        <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
          <span>Admin</span>
          <span>admin@leaveflow.com / admin123</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1 mb-1">
          <span>Manager</span>
          <span>manager@leaveflow.com / pass123</span>
        </div>
        <div className="flex justify-between">
          <span>Employee</span>
          <span>employee1@leaveflow.com / pass123</span>
        </div>
      </div>
    </motion.div>
  );
}
