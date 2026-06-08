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
      className="glass-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-[var(--glass-border)] flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Requests</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[var(--text-muted)] uppercase bg-white/5">
            <tr>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Dates</th>
              <th className="px-6 py-3">Days</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id} className="border-b border-[var(--glass-border)] hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {LEAVE_TYPE_LABELS[leave.leave_type] || leave.leave_type}
                </td>
                <td className="px-6 py-4 text-[var(--text-secondary)]">
                  {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4">{leave.days}</td>
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
