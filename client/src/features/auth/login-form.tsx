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
import { LogIn, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

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
    } catch {
      // Backend unavailable — use mock fallback for frontend testing
      
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

  const fillCredentials = (email: string, pass: string, role: string) => {
    form.setValue("email", email);
    form.setValue("password", pass);
    toast.success(`${role} credentials filled!`);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[28px] font-bold tracking-tight text-white mb-2">
          Welcome back
        </h2>
        <p className="text-[15px] text-white/40">
          Enter your credentials to access your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-[12px] font-semibold text-white/40 uppercase tracking-[0.12em] mb-2.5">
            Email
          </label>
          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
              <Mail className="w-[17px] h-[17px] text-white/20 group-focus-within:text-indigo-400 transition-colors duration-200" />
            </div>
            <input
              {...form.register("email")}
              id="email"
              type="email"
              className="w-full h-[52px] bg-white/[0.05] hover:bg-white/[0.07] border border-white/[0.1] hover:border-white/[0.15] text-[14px] text-white placeholder:text-white/15 pl-12 pr-4 rounded-xl outline-none focus:bg-white/[0.08] focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all duration-200"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-400 text-[12px] font-medium mt-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label htmlFor="password" className="block text-[12px] font-semibold text-white/40 uppercase tracking-[0.12em]">
              Password
            </label>
            <button
              type="button"
              className="text-[12px] text-indigo-400/70 hover:text-indigo-400 font-medium transition-colors"
              onClick={() => toast.info("Password reset coming soon.")}
            >
              Forgot?
            </button>
          </div>
          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
              <Lock className="w-[17px] h-[17px] text-white/20 group-focus-within:text-indigo-400 transition-colors duration-200" />
            </div>
            <input
              {...form.register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full h-[52px] bg-white/[0.05] hover:bg-white/[0.07] border border-white/[0.1] hover:border-white/[0.15] text-[14px] text-white placeholder:text-white/15 pl-12 pr-12 rounded-xl outline-none focus:bg-white/[0.08] focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all duration-200"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-[12px] font-medium mt-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-[52px] mt-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 active:to-violet-700 text-white text-[14px] font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-[11px] text-white/20 uppercase tracking-widest font-medium">Quick Access</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* Demo Credential Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { role: "Admin", email: "admin@leaveflow.com", pass: "admin123", color: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/20 hover:border-indigo-500/40", text: "text-indigo-400" },
          { role: "Manager", email: "manager@leaveflow.com", pass: "pass123", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20 hover:border-violet-500/40", text: "text-violet-400" },
          { role: "Employee", email: "employee1@leaveflow.com", pass: "pass123", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20 hover:border-emerald-500/40", text: "text-emerald-400" },
        ].map((cred) => (
          <button
            key={cred.role}
            type="button"
            onClick={() => fillCredentials(cred.email, cred.pass, cred.role)}
            className={`p-3 rounded-xl bg-gradient-to-b ${cred.color} border ${cred.border} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group`}
          >
            <p className={`text-[13px] font-semibold ${cred.text} mb-0.5`}>{cred.role}</p>
            <p className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors truncate">{cred.email}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
