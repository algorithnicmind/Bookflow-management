"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useAuthStore } from "@/store/auth-store";
import { loginUser } from "@/services/auth.service";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await loginUser(data.email, data.password);
      login(response.access_token, response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Unable to connect to server.";
      toast.error("Login failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  const fillCredentials = (email: string, pass: string, role: string) => {
    form.setValue("email", email);
    form.setValue("password", pass);
    toast.success(`${role} credentials filled`);
  };

  const demoCredentials = [
    { role: "Super Admin", email: "superadmin@company.com" },
    { role: "Manager", email: "alice@company.com" },
    { role: "Employee", email: "john@company.com" },
  ];

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          Welcome back
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Please sign in to your account
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Email address
          </label>
          <input
            {...form.register("email")}
            type="email"
            className="input-field"
            placeholder="you@company.com"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-[var(--danger)] text-xs mt-1.5">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
            >
              Forgot?
            </button>
          </div>
          <div className="relative">
            <input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              className="input-field pr-10"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-[var(--danger)] text-xs mt-1.5">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-2 h-11"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-secondary)] font-medium mb-3 text-center uppercase tracking-wider">
          Demo Accounts
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {demoCredentials.map((cred) => (
            <button
              key={cred.role}
              type="button"
              onClick={() => fillCredentials(cred.email, "password123", cred.role)}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium"
            >
              {cred.role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
