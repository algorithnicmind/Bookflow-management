"use client";

import { motion } from "framer-motion";
import { AnalyticsDashboard } from "@/features/analytics/analytics-dashboard";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { BarChart3, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function AnalyticsPage() {
  const { user } = useAuthStore();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 lg:space-y-8"
    >
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            Analytics Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1.5 ml-14">
            Gain insights into organizational leave trends and statistics
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Data</span>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="relative z-10">
        <AnalyticsDashboard />
      </motion.div>
    </motion.div>
  );
}
