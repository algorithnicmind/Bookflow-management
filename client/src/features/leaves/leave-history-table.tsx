"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Search, XCircle, Filter, CalendarDays, Clock, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getLeaveHistory, cancelLeave } from "@/services/leaves.service";
import { LeaveRequest } from "@/types/leave.types";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { skeletonPulse } from "@/lib/animations";

const STATUS_FILTERS = [
  { id: "all", label: "All Requests" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "cancelled", label: "Cancelled" },
];

export function LeaveHistoryTable() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);

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
    setIsCancelling(id);
    setCancelTarget(null);
    try {
      await cancelLeave(id);
      toast.success("Leave request cancelled successfully.");
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to cancel request.");
    } finally {
      setIsCancelling(null);
    }
  };

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(
    () => [
      {
        accessorKey: "leave_type",
        header: "Leave Type",
        cell: ({ row }) => {
          const type = row.getValue("leave_type") as string;
          const reason = row.original.reason;
          return (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="font-bold text-white capitalize">
                  {type} Leave
                </p>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 max-w-[200px] truncate" title={reason}>
                  {reason}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "date_range",
        header: "Duration",
        cell: ({ row }) => {
          const start = new Date(row.original.start_date);
          const end = new Date(row.original.end_date);
          return (
            <div className="flex items-center gap-2 text-white/60">
              <CalendarDays className="w-4 h-4 text-[var(--text-muted)]" />
              <div>
                <span className="font-semibold text-white/80">{format(start, "MMM dd")}</span>
                <span className="mx-1.5 text-[var(--text-muted)]">→</span>
                <span className="font-semibold text-white/80">{format(end, "MMM dd, yyyy")}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "days",
        header: "Days",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center min-w-[2rem] h-8 bg-white/5 rounded-lg border border-white/10 font-bold text-sm text-white">
              {row.getValue("days")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status") as any} />,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const leave = row.original;
          return (
            <div className="flex justify-end">
              {leave.status === "pending" ? (
                <button
                  onClick={() => setCancelTarget(leave)}
                  disabled={isCancelling === leave.id}
                  className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                  {isCancelling === leave.id ? "Cancelling..." : "Cancel"}
                </button>
              ) : (
                <span className="text-xs font-bold text-[var(--text-muted)]">—</span>
              )}
            </div>
          );
        },
      },
    ],
    [isCancelling]
  );

  return (
    <div className="space-y-6">
      {/* Filter Chips */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-widest">Filter by Status</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === filter.id 
                  ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-400' 
                  : 'bg-white/5 text-[var(--text-secondary)] border border-white/5 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card-static border border-[var(--border)] overflow-hidden">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-4"
            >
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div 
                  key={i} 
                  variants={skeletonPulse} 
                  initial="initial" 
                  animate="animate" 
                  className="h-16 w-full bg-white/[0.02] border border-[var(--border)] rounded-xl"
                />
              ))}
            </motion.div>
          ) : leaves.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12"
            >
              <EmptyState
                title="No records found"
                description={statusFilter === "all" ? "You haven't applied for any leave yet." : `No ${statusFilter} leave requests found.`}
                icon="📭"
                actionLabel={statusFilter === "all" ? "Apply for Leave" : undefined}
                actionHref={statusFilter === "all" ? "/apply-leave" : undefined}
              />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <DataTable
                columns={columns}
                data={leaves}
                searchKey="leave_type"
                searchPlaceholder="Search leave type..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onConfirm={() => { if (cancelTarget) return handleCancel(cancelTarget.id); }}
        title="Cancel Leave Request"
        description={`Are you sure you want to cancel your ${cancelTarget?.leave_type || ''} leave request? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Request"
        cancelLabel="Keep Request"
        variant="warning"
        icon={<XCircle className="w-6 h-6" />}
        isLoading={isCancelling !== null}
      />
    </div>
  );
}
