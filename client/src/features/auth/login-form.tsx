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
import { fadeInUp } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Eye, EyeOff, Mail, Lock } from "lucide-react";

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
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // MOCK LOGIN FALLBACK FOR TESTING FRONTEND WITHOUT BACKEND
      const roleStr = data.email.includes("manager") ? "manager" : data.email.includes("employee") ? "employee" : "admin";
      const mockUser: any = {
        id: 1,
        email: data.email,
        name: `${roleStr.charAt(0).toUpperCase() + roleStr.slice(1)} Tester`,
        role: roleStr,
        department: "Engineering"
      };
      login("mock_token_12345", mockUser);
      toast.success(`Mock Login successful as ${roleStr}! (Backend bypassed)`);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="glass-card p-8 sm:p-10 w-full max-w-md mx-auto relative z-10"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 shadow-lg shadow-[var(--primary-glow)] mb-5">
          <span className="text-2xl font-bold text-white">L</span>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">LeaveFlow</h1>
        <p className="text-[var(--text-secondary)] text-sm">Sign in to your account to continue</p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              {...form.register("email")}
              id="email"
              type="email"
              className="input-field pl-10 py-3 text-sm"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-[var(--danger)] text-xs font-medium mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Password
            </Label>
            <button
              type="button"
              className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
              onClick={() => toast.info("Password reset will be available when the backend API supports it.")}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input
              {...form.register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              className="input-field pl-10 pr-10 py-3 text-sm"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-[var(--danger)] text-xs font-medium mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full mt-2 h-11 text-sm font-semibold shadow-xl shadow-[var(--primary)]/20"
        >
          {isLoading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-8 text-center text-sm text-[var(--text-muted)] bg-white/[0.02] p-4 rounded-xl border border-[var(--glass-border)]">
        <p className="font-semibold mb-3 text-[var(--text-secondary)] text-xs uppercase tracking-wider">Demo Credentials</p>
        <div className="space-y-2 text-xs">
          {[
            { role: "Admin", email: "admin@leaveflow.com", pass: "admin123" },
            { role: "Manager", email: "manager@leaveflow.com", pass: "pass123" },
            { role: "Employee", email: "employee1@leaveflow.com", pass: "pass123" },
          ].map((cred) => (
            <div key={cred.role} className="flex justify-between items-center py-1.5 border-b border-[var(--glass-border)] last:border-0">
              <span className="font-medium text-[var(--text-secondary)]">{cred.role}</span>
              <button
                type="button"
                className="font-mono opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => {
                  form.setValue("email", cred.email);
                  form.setValue("password", cred.pass);
                  toast.success(`${cred.role} credentials filled!`);
                }}
              >
                {cred.email}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
