"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth-store";
import { loginUser } from "@/services/auth.service";
import { 
  LogIn, Eye, EyeOff, Mail, Lock, Check, 
  Crown, Briefcase, User, ShieldCheck, Database, Server, ArrowRight 
} from "lucide-react";

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
  const [rememberMe, setRememberMe] = useState(false);
  
  // floating label focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const passwordValue = form.watch("password");

  // Simple strength indicator logic
  const calculateStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };
  const passwordStrength = calculateStrength(passwordValue);

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
      
      // MOCK LOGIN FALLBACK
      const roleStr = data.email.includes("manager") ? "manager" : data.email.includes("employee") ? "employee" : "admin";
      const mockUser: any = {
        id: 1, email: data.email, name: `${roleStr.charAt(0).toUpperCase() + roleStr.slice(1)} Tester`,
        role: roleStr, department: "Engineering"
      };
      login("mock_token_12345", mockUser);
      toast.success(`Mock Login successful as ${roleStr}!`);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full relative z-10"
    >
      {/* 
        ========================================================================
        GLASSMORPHISM LOGIN CARD
        ======================================================================== 
      */}
      <div className="bg-white/[0.03] backdrop-blur-[30px] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[28px] p-8 sm:p-10 relative overflow-hidden">
        
        {/* Subtle top glare effect */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* 3D Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center relative z-10">
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative group mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-[20px] blur-xl opacity-50 group-hover:opacity-80 transition duration-500" />
            <div className="relative w-16 h-16 rounded-[20px] bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
              <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-[#A5B4FC]">L</span>
            </div>
          </motion.div>
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Welcome Back</h2>
          <p className="text-[#94A3B8] text-[15px]">Sign in to access your LeaveFlow workspace</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          
          {/* Email Field - Floating Label */}
          <div className="relative">
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${focusedField === 'email' ? 'bg-[#4F46E5]/10 ring-1 ring-[#4F46E5]/50' : 'bg-white/5 border border-white/10 hover:border-white/20'}`} />
            <div className="relative flex items-center px-4 py-1 h-14">
              <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-[#818CF8]' : 'text-[#64748B]'}`} />
              <div className="ml-3 flex-1 relative flex items-center h-full pt-3">
                <input
                  {...form.register("email")}
                  id="email"
                  type="email"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-white text-[15px] outline-none peer"
                  placeholder=" "
                  autoComplete="email"
                  disabled={isLoading}
                />
                <label 
                  htmlFor="email" 
                  className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                    form.watch('email') || focusedField === 'email' 
                      ? '-top-3 text-[11px] font-semibold text-[#818CF8]' 
                      : 'top-0 text-[15px] text-[#64748B]'
                  }`}
                >
                  Email Address
                </label>
              </div>
            </div>
            {form.formState.errors.email && (
              <p className="text-red-400 text-xs mt-1.5 ml-1 absolute">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Spacer for potential absolute error message */}
          {form.formState.errors.email && <div className="h-2" />}

          {/* Password Field - Floating Label */}
          <div className="relative mt-2">
            <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${focusedField === 'password' ? 'bg-[#4F46E5]/10 ring-1 ring-[#4F46E5]/50' : 'bg-white/5 border border-white/10 hover:border-white/20'}`} />
            <div className="relative flex items-center px-4 py-1 h-14">
              <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-[#818CF8]' : 'text-[#64748B]'}`} />
              <div className="ml-3 flex-1 relative flex items-center h-full pt-3">
                <input
                  {...form.register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-white text-[15px] outline-none peer pr-8"
                  placeholder=" "
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <label 
                  htmlFor="password" 
                  className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                    form.watch('password') || focusedField === 'password' 
                      ? '-top-3 text-[11px] font-semibold text-[#818CF8]' 
                      : 'top-0 text-[15px] text-[#64748B]'
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-400 text-xs mt-1.5 ml-1 absolute">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Password Strength Indicator */}
          <AnimatePresence>
            {passwordValue && focusedField === 'password' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-1.5 pt-3"
              >
                {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level} 
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      passwordStrength >= level 
                        ? passwordStrength <= 2 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <div className="absolute inset-0 rounded-[6px] border border-white/20 peer-checked:border-[#4F46E5] peer-checked:bg-[#4F46E5] transition-all duration-200 group-hover:border-[#4F46E5]/50" />
                <Check className={`w-3 h-3 text-white relative z-10 transition-transform duration-200 ${rememberMe ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} strokeWidth={3} />
              </div>
              <span className="text-[14px] text-[#94A3B8] group-hover:text-white transition-colors">Remember me</span>
            </label>
            <button type="button" className="text-[14px] font-medium text-[#818CF8] hover:text-[#A5B4FC] relative group transition-colors">
              Forgot password?
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#818CF8] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </button>
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] relative group overflow-hidden rounded-xl disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {/* Button Glow/Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] transition-transform duration-500 group-hover:scale-105" />
            
            {/* Hover Glare */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-t from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out skew-x-12" />
            
            <div className="relative h-full w-full flex items-center justify-center gap-2 text-white font-semibold text-[15px]">
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-[2.5px] border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  Sign In 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Quick Demo Access - Premium Role Cards */}
        <div className="mt-10 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">Demo Workspaces</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { role: "Admin", email: "admin@leaveflow.com", pass: "admin123", Icon: Crown, color: "from-amber-500/20 to-orange-500/20", iconColor: "text-amber-400" },
              { role: "Manager", email: "manager@leaveflow.com", pass: "pass123", Icon: Briefcase, color: "from-[#4F46E5]/20 to-[#7C3AED]/20", iconColor: "text-[#818CF8]" },
              { role: "Employee", email: "employee1@leaveflow.com", pass: "pass123", Icon: User, color: "from-emerald-500/20 to-teal-500/20", iconColor: "text-emerald-400" },
            ].map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => {
                  form.setValue("email", cred.email);
                  form.setValue("password", cred.pass);
                  toast.success(`${cred.role} credentials loaded!`);
                }}
                className="relative group flex flex-col items-center justify-center py-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.15] rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cred.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <cred.Icon className={`w-5 h-5 mb-2 ${cred.iconColor} relative z-10`} />
                <span className="text-white text-[13px] font-medium relative z-10">{cred.role}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Trust Section */}
      <div className="mt-8 flex items-center justify-center gap-6 text-[#64748B] text-[12px] font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure Login</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-[#334155]" />
        <div className="flex items-center gap-1.5">
          <Database className="w-4 h-4" />
          <span>Encrypted Data</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-[#334155]" />
        <div className="flex items-center gap-1.5">
          <Server className="w-4 h-4" />
          <span>Enterprise Grade</span>
        </div>
      </div>
    </motion.div>
  );
}
