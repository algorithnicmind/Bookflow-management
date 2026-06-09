import { motion } from "framer-motion";
import { LeaveBalance } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";

export function BalanceCards({ balances }: { balances: LeaveBalance[] }) {
  if (!balances || balances.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="text-2xl">⚖️</span>
        <span className="gradient-text">Leave Balances</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {balances.map((balance, i) => {
          const used = balance.used_days;
          const percentage = Math.min(100, Math.max(0, (used / balance.total_days) * 100));
          
          return (
            <motion.div
              key={balance.leave_type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="glass-card p-6 group hover:border-[var(--primary)]/30 transition-colors"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-[var(--text-primary)] text-lg">
                  {LEAVE_TYPE_LABELS[balance.leave_type] || balance.leave_type}
                </span>
                <span className="text-sm font-black bg-gradient-to-r from-[var(--primary)] to-purple-600 px-3 py-1.5 rounded-lg text-white shadow-md shadow-[var(--primary)]/20">
                  {balance.remaining} left
                </span>
              </div>
              
              <div className="relative w-full bg-white/5 rounded-full h-3 mb-3 overflow-hidden shadow-inner border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-indigo-500 shadow-[0_0_10px_var(--primary)]" 
                />
              </div>
              
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <span>{used} Used</span>
                <span>{balance.total_days} Total</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
