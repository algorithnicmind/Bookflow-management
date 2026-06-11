"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[var(--info-bg)] to-transparent opacity-50 pointer-events-none" />

      {/* Navigation */}
      <nav className="absolute top-0 w-full px-6 py-4 flex items-center justify-between z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-md">
            L
          </div>
          LeaveFlow
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-sm transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-[var(--primary)]" />
          LeaveFlow 2.0 is now live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6 leading-[1.1]"
        >
          Manage time off <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-cyan-500">
            without the chaos.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl font-light"
        >
          The fastest, most elegant way to track employee leaves, approve requests, and maintain perfect team visibility.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-[var(--primary-hover)] transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] px-8 py-3.5 rounded-full text-base font-medium hover:bg-[var(--bg-tertiary)] transition-all active:scale-95"
          >
            Explore features
          </a>
        </motion.div>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-[var(--text-secondary)]"
        >
          {[
            "Instant Approvals",
            "Real-time Dashboard",
            "Role-based Access",
            "Beautiful Interface",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
              {feature}
            </div>
          ))}
        </motion.div>
      </main>

      {/* Abstract Graphic Element below */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl h-64 bg-gradient-to-t from-[var(--bg-primary)] to-transparent absolute bottom-0 z-0 border-t border-[var(--border)] rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.2)]"
      >
        <div className="w-full h-full bg-[var(--bg-secondary)] opacity-50 rounded-t-[3rem]" />
      </motion.div>
    </div>
  );
}
