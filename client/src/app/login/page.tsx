"use client";

import { LoginForm } from "@/features/auth/login-form";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0B0F19]">
      {/* ─── Left Panel: Hero & Glass Widget ─── */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden items-center justify-center p-12 xl:p-16">
        {/* Sleek, deep neon glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/[0.15] rounded-full blur-[150px] animate-pulse-glow"
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-600/[0.12] rounded-full blur-[140px] animate-pulse-glow"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Minimal grid texture */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="z-10 text-left max-w-lg w-full relative"
        >
          {/* Logo Mark */}
          <div className="inline-flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <span className="text-xl font-bold text-white tracking-tight">
                L
              </span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">LeaveFlow</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.75rem] xl:text-[3rem] leading-[1.1] font-extrabold text-white mb-6 tracking-tight">
            Time off management,<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              beautifully simple.
            </span>
          </h1>

          <p className="text-white/40 text-base leading-relaxed mb-12 max-w-md font-light">
            An ultra-modern platform to request, approve, and track employee leaves. Fast, spacious, and sophisticated.
          </p>

          {/* Floating Glassmorphism Dashboard Widget */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            {/* Widget Container */}
            <div className="w-full p-6 rounded-3xl bg-white/[0.02] backdrop-blur-2xl border border-white/[0.04] shadow-2xl shadow-indigo-900/10 overflow-hidden relative group">
              {/* Subtle inner highlight */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.02] pointer-events-none" />
              
              {/* Notification Header */}
              <div className="flex gap-4 items-start mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white font-medium text-sm">
                      Request Approved
                    </h3>
                    <span className="text-[10px] text-white/30 font-medium">
                      Just now
                    </span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Winter vacation (Dec 24 – Jan 2) approved by Management.
                  </p>
                </div>
              </div>

              {/* Seamless Stats Grid */}
              <div className="grid grid-cols-3 gap-px bg-white/[0.03] rounded-2xl overflow-hidden">
                {[
                  { label: "Available", value: "12", color: "text-white" },
                  { label: "Pending", value: "1", color: "text-amber-400" },
                  { label: "Approved", value: "5", color: "text-emerald-400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 bg-[#0B0F19]/40 backdrop-blur-sm flex flex-col items-center justify-center text-center"
                  >
                    <p className={`text-xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-white/30 font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Decorative background blur under widget */}
            <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl -z-10 rounded-full opacity-50" />
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Right Panel: Borderless Login Form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-hidden bg-[#0B0F19]">
        {/* Subtle right-side ambient glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[20%] right-[-20%] w-[30rem] h-[30rem] bg-indigo-500/[0.05] rounded-full blur-[120px]"
          />
        </div>

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2.5 z-20">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-sm font-bold text-white">L</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            LeaveFlow
          </span>
        </div>

        {/* Borderless form container with generous whitespace */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-[400px] z-10 relative px-4"
        >
          <LoginForm />
        </motion.div>

        {/* Footer text */}
        <p className="absolute bottom-6 text-[11px] text-white/20 z-10 font-light">
          © 2026 LeaveFlow · Elevating team operations
        </p>
      </div>
    </div>
  );
}
