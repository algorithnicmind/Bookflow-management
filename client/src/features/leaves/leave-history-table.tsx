"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { getLeaveHistory, cancelLeave } from "@/services/leaves.service";
import { LeaveRequest } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export function LeaveHistoryTable() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCancelling, setIsCancelling] = useState<number | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLeaveHistory(statusFilter);
      setLeaves(data.leaves);
    } catch (err) {
      console.error("Failed to fetch leave history", err);
      toast.error("Could not load your leave history.");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;

    setIsCancelling(id);
    try {
      await cancelLeave(id);
      toast.success("Leave request cancelled successfully.");
      // Refresh the list
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to cancel request.");
    } finally {
      setIsCancelling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 border-l-4 border-[var(--primary)] hover:border-[var(--primary-hover)] transition-colors">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <span className="text-[var(--text-primary)]">Filter Records</span>
        </h3>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[200px] shadow-sm font-semibold"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-[var(--glass-border)]">
        {isLoading ? (
          <div className="p-8">
            <LoadingSkeleton lines={5} />
          </div>
        ) : leaves.length === 0 ? (
          <EmptyState 
            title="No records found" 
            description={statusFilter === "all" ? "You haven't applied for any leave yet." : `No ${statusFilter} leave requests found.`}
            icon="📝"
            actionLabel={statusFilter === "all" ? "Apply for Leave" : undefined}
            actionHref="/apply-leave"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-secondary)]/50">
                <tr>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Type</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Date Range</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)] text-center">Days</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)]">Status</th>
                  <th className="px-6 py-4 border-b border-[var(--glass-border)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                {leaves.map((leave, index) => (
                  <motion.tr 
                    key={leave.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-[var(--primary)]/5 transition-colors cursor-default"
                  >
                    <td className="px-6 py-4 font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {LEAVE_TYPE_LABELS[leave.leave_type] || leave.leave_type}
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                      <div>{format(new Date(leave.start_date), "MMM d, yyyy")}</div>
                      <div className="text-xs text-[var(--text-muted)]">to {format(new Date(leave.end_date), "MMM d, yyyy")}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5">{leave.days}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === "pending" ? (
                        <button
                          onClick={() => handleCancel(leave.id)}
                          disabled={isCancelling === leave.id}
                          className="text-[var(--danger)] bg-[var(--danger)]/5 hover:bg-[var(--danger)]/15 border border-[var(--danger)]/20 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold disabled:opacity-50"
                        >
                          {isCancelling === leave.id ? "Cancelling..." : "Cancel"}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-[var(--text-muted)] opacity-50">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
