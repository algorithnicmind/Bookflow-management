"use client";

import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-tertiary)] flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--primary)] opacity-[0.03] blur-[100px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-[var(--primary)] opacity-[0.04] blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <div className="w-full p-6 z-10 flex justify-between items-center max-w-7xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-[var(--text-primary)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-md">
            L
          </div>
          LeaveFlow
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 z-10 w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full glass-card p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Subtle top border accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--primary)] to-cyan-500" />
          
          <LoginForm />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-center text-xs text-[var(--text-muted)] max-w-xs"
        >
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </div>
    </div>
  );
}
