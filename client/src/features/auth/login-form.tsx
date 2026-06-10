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
      className="glass-card p-8 sm:p-10 w-full max-w-md mx-auto relative z-10"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 shadow-lg shadow-[var(--primary)]/20 mb-6">
          <span className="text-3xl">🚀</span>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">LeaveFlow</h1>
        <p className="text-[var(--text-secondary)]">Sign in to your account to continue</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wide">
            Email Address
          </label>
          <input
            {...form.register("email")}
            type="email"
            className="input-field py-3 text-lg font-medium"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-[var(--danger)] text-xs mt-2 font-bold">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wide">
            Password
          </label>
          <input
            {...form.register("password")}
            type="password"
            className="input-field py-3 text-lg font-medium"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-[var(--danger)] text-xs mt-2 font-bold">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-6 flex justify-center items-center h-12 text-base font-bold shadow-xl shadow-[var(--primary)]/20"
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center text-sm text-[var(--text-muted)] bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-white/5">
        <p className="font-bold mb-3 text-[var(--text-secondary)]">Demo Credentials</p>
        <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
          <span className="font-medium">Admin</span>
          <span className="font-mono text-xs opacity-80">admin@leaveflow.com / admin123</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
          <span className="font-medium">Manager</span>
          <span className="font-mono text-xs opacity-80">manager@leaveflow.com / pass123</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Employee</span>
          <span className="font-mono text-xs opacity-80">employee1@leaveflow.com / pass123</span>
        </div>
      </div>
    </motion.div>
  );
}
