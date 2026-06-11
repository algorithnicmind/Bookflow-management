"use client";

import { motion } from "framer-motion";
import { ApplyLeaveForm } from "@/features/leaves/apply-leave-form";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { PenSquare, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function ApplyLeavePage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={staggerItem} className="page-header bg-gradient-to-br from-indigo-500/10 to-transparent p-6 sm:p-8 rounded-3xl border border-indigo-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <PenSquare className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            New Request
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
            Apply for Leave
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] max-w-xl">
            Fill out the form below to request time off. Your manager will be notified immediately upon submission.
          </p>
          
          <div className="mt-6">
            <Link 
              href={ROUTES.LEAVE_HISTORY}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors group"
            >
              <Calendar className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-400 transition-colors" />
              View your leave history & balances →
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="relative z-20">
        <div className="glass-card-accent p-6 sm:p-8">
          <ApplyLeaveForm />
        </div>
      </motion.div>
    </motion.div>
  );
}
