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
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const itemVariants: any = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

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
      toast.success(`Welcome back, ${response.user.name}!`, {
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || "Unable to connect to server. Please try again.";
      toast.error("Login failed", { description: message });
      const formEl = document.getElementById("login-form");
      if (formEl) {
        formEl.classList.add("animate-shake");
        setTimeout(() => formEl.classList.remove("animate-shake"), 500);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const fillCredentials = (email: string, pass: string, role: string) => {
    form.setValue("email", email);
    form.setValue("password", pass);
    toast.success(`${role} credentials filled`, {
      description: `Email: ${email}`,
    });
  };

  const demoCredentials = [
    { role: "Super Admin", email: "superadmin@company.com", pass: "password123", dot: "bg-indigo-400" },
    { role: "Admin", email: "admin@company.com", pass: "password123", dot: "bg-purple-400" },
    { role: "Manager", email: "alice@company.com", pass: "password123", dot: "bg-emerald-400" },
    { role: "Employee", email: "john@company.com", pass: "password123", dot: "bg-blue-400" },
  ];

  return (
    <div className="w-full max-w-[360px] mx-auto">
      {/* Header */}
      <motion.div
        custom={0}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="text-[28px] font-bold tracking-tight text-white mb-1.5">
          Sign in
        </h2>
        <p className="text-[14px] text-white/50 leading-relaxed font-light">
          Enter your details to access your account.
        </p>
      </motion.div>

      {/* Form */}
      <form
        id="login-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Email Field */}
        <motion.div
          custom={1}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-white/80 mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <input
              {...form.register("email")}
              id="email"
              type="email"
              className="w-full bg-[#111827] border border-slate-800 text-[14px] text-white placeholder:text-white/20 px-4 py-3 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
              placeholder="name@company.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-rose-400 text-[12px] font-medium mt-1.5">
              {form.formState.errors.email.message}
            </p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          custom={2}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-white/80"
            >
              Password
            </label>
            <button
              type="button"
              className="text-[13px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              onClick={() => toast.info("Password reset coming soon.")}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              {...form.register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full bg-[#111827] border border-slate-800 text-[14px] text-white placeholder:text-white/20 pl-4 pr-11 py-3 rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-rose-400 text-[12px] font-medium mt-1.5">
              {form.formState.errors.password.message}
            </p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          custom={3}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="pt-2"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[46px] bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] text-white text-[14px] font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </motion.div>
      </form>

      {/* Quick Access List */}
      <motion.div
        custom={4}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mt-12"
      >
        <p className="text-[12px] text-white/40 font-medium mb-3">
          Quick Access (Demo)
        </p>
        <div className="flex flex-wrap gap-2.5">
          {demoCredentials.map((cred) => (
            <button
              key={cred.role}
              type="button"
              onClick={() => fillCredentials(cred.email, cred.pass, cred.role)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-white/60 hover:text-white text-[12px] font-medium group"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cred.dot} opacity-70 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
              {cred.role}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
