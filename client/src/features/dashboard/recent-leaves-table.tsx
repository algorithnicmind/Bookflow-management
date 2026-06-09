import { motion } from "framer-motion";
import { LeaveRequest } from "@/types/leave.types";
import { format } from "date-fns";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { StatusBadge } from "@/components/shared/status-badge";

export function RecentLeavesTable({ leaves }: { leaves: LeaveRequest[] }) {
  if (!leaves || leaves.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass-card overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-[var(--glass-border)]"
    >
      <div className="px-6 py-5 border-b border-[var(--glass-border)] bg-white/5 flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent pointer-events-none" />
        <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
          <span className="text-2xl">📋</span>
          <span className="gradient-text">Recent Requests</span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-secondary)]/50">
            <tr>
              <th className="px-6 py-4 border-b border-[var(--glass-border)]">Type</th>
              <th className="px-6 py-4 border-b border-[var(--glass-border)]">Dates</th>
              <th className="px-6 py-4 border-b border-[var(--glass-border)] text-center">Days</th>
              <th className="px-6 py-4 border-b border-[var(--glass-border)]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {leaves.map((leave) => (
              <tr key={leave.id} className="group hover:bg-[var(--primary)]/5 transition-colors cursor-default">
                <td className="px-6 py-4 font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                  {LEAVE_TYPE_LABELS[leave.leave_type] || leave.leave_type}
                </td>
                <td className="px-6 py-4 font-medium text-[var(--text-secondary)]">
                  {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-center font-bold">
                  <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5">{leave.days}</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={leave.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
