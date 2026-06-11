"use client";

import { LeaveBalance } from "@/types/leave.types";
import { motion } from "framer-motion";
import { staggerContainerFast, cardItem } from "@/lib/animations";
import { Briefcase, HeartPulse, Sparkles, AlertCircle, Baby, HeartHandshake } from "lucide-react";

interface BalanceCardsProps {
  balances: LeaveBalance[];
}

export function BalanceCards({ balances }: BalanceCardsProps) {
  if (!balances || balances.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 text-center flex flex-col items-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm">No leave balances found.</p>
      </div>
    );
  }

  const getTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "casual":
        return {
          icon: Sparkles,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          progressBg: "bg-blue-500",
        };
      case "sick":
        return {
          icon: HeartPulse,
          color: "text-rose-400",
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
          progressBg: "bg-rose-500",
        };
      case "earned":
        return {
          icon: Briefcase,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          progressBg: "bg-emerald-500",
        };
      case "maternity":
        return {
          icon: Baby,
          color: "text-pink-400",
          bg: "bg-pink-500/10",
          border: "border-pink-500/20",
          progressBg: "bg-pink-500",
        };
      case "miscarriage":
        return {
          icon: HeartHandshake,
          color: "text-purple-400",
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
          progressBg: "bg-purple-500",
        };
      default:
        return {
          icon: Briefcase,
          color: "text-indigo-400",
          bg: "bg-indigo-500/10",
          border: "border-indigo-500/20",
          progressBg: "bg-indigo-500",
        };
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Your Time Off Balances
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Available leave days for current year</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainerFast}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {balances.map((balance, i) => {
          const style = getTypeStyle(balance.leave_type);
          const Icon = style.icon;
          const percentage = Math.min(100, Math.max(0, (balance.used_days / balance.total_days) * 100));

          return (
            <motion.div
              key={balance.leave_type}
              custom={i}
              variants={cardItem}
              className={`bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-5 relative overflow-hidden group hover:border-[var(--primary)]/30 transition-colors shadow-sm`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white capitalize text-sm">
                      {balance.leave_type} Leave
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-semibold mt-0.5">
                      {balance.total_days} Days Total
                    </p>
                  </div>
                </div>
              </div>

              {/* Numbers */}
              <div className="flex items-end justify-between mb-3 relative z-10">
                <div>
                  <span className="text-3xl font-extrabold text-white">
                    {balance.remaining}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-2 font-medium">remaining</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white/60">
                    {balance.used_days}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-1">used</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10">
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${style.progressBg} relative`}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  </motion.div>
                </div>
              </div>

              {/* Background Glow */}
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full ${style.progressBg} blur-[50px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
