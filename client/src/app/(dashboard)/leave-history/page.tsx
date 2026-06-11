"use client";

import { motion } from "framer-motion";
import { LeaveHistoryTable } from "@/features/leaves/leave-history-table";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { CalendarDays, Filter } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function LeaveHistoryPage() {
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
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
            </div>
            Leave History
          </h1>
          <p className="text-white/40 text-sm mt-1.5 ml-14">
            View your past requests and track your remaining balance
          </p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="relative z-10">
        <LeaveHistoryTable />
      </motion.div>
    </motion.div>
  );
}
