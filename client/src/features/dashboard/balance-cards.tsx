import { motion } from "framer-motion";
import { LeaveBalance } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";

export function BalanceCards({ balances }: { balances: LeaveBalance[] }) {
  if (!balances || balances.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Leave Balances</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map((balance, i) => {
          const used = balance.total_allocated - balance.remaining;
          const percentage = Math.min(100, Math.max(0, (used / balance.total_allocated) * 100));
          
          return (
            <motion.div
              key={balance.leave_type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="glass-card p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-[var(--text-secondary)]">
                  {LEAVE_TYPE_LABELS[balance.leave_type] || balance.leave_type}
                </span>
                <span className="text-sm font-bold bg-white/5 px-2 py-1 rounded-md">
                  {balance.remaining} remaining
                </span>
              </div>
              
              <div className="w-full bg-[var(--glass-border)] rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                  className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>{used} used</span>
                <span>{balance.total_allocated} total</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
