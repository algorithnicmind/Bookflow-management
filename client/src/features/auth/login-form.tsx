"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { loginUser } from "@/services/auth.service";
import { Loader2, Mail, Lock, Key } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
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

  const fillDemo = (email: string, pass: string) => {
    form.setValue("email", email);
    form.setValue("password", pass);
  };

  return (
    <div className="w-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-2">
            EMAIL ADDRESS
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              {...form.register("email")}
              type="email"
              className="w-full bg-transparent border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#083A81] focus:ring-1 focus:ring-[#083A81] transition-all text-sm"
              placeholder="name@company.com"
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-500 text-xs mt-1.5">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-widest">
              PASSWORD
            </label>
            <button
              type="button"
              className="text-[11px] text-[#083A81] font-bold hover:underline transition-all"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              {...form.register("password")}
              type="password"
              className="w-full bg-transparent border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#083A81] focus:ring-1 focus:ring-[#083A81] transition-all text-sm tracking-widest"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-500 text-xs mt-1.5">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            {...form.register("remember")}
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-gray-300 text-[#083A81] focus:ring-[#083A81]"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#083A81] hover:bg-[#062a60] text-white font-medium rounded-lg py-2.5 mt-2 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-500 uppercase">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button
          type="button"
          className="w-full bg-transparent border border-gray-300 text-gray-800 hover:bg-gray-50 font-medium rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <Key className="w-4 h-4 text-[#083A81]" />
          Login with SSO
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account? <span className="font-bold text-[#083A81] cursor-pointer hover:underline">Contact your HR Administrator</span>
        </p>
      </div>

      {/* Demo Credentials Section */}
      <div className="mt-8 border-t border-gray-200 pt-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 text-center">DEMO CREDENTIALS</p>
        <div className="space-y-1">
          <div 
            className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
            onClick={() => fillDemo("admin@leaveflow.com", "admin123")}
          >
            <span className="text-gray-700 font-medium">Admin</span>
            <span className="text-gray-500 font-mono">admin@leaveflow.com</span>
          </div>
          <div 
            className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
            onClick={() => fillDemo("manager@leaveflow.com", "pass123")}
          >
            <span className="text-gray-700 font-medium">Manager</span>
            <span className="text-gray-500 font-mono">manager@leaveflow.com</span>
          </div>
          <div 
            className="flex justify-between items-center text-xs cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors"
            onClick={() => fillDemo("employee1@leaveflow.com", "pass123")}
          >
            <span className="text-gray-700 font-medium">Employee</span>
            <span className="text-gray-500 font-mono">employee1@leaveflow.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
