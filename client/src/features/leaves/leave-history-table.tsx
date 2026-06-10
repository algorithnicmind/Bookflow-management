"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";

import { getLeaveHistory, cancelLeave } from "@/services/leaves.service";
import { LeaveRequest } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { DataTable } from "@/components/shared/data-table";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

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

  const columns = useMemo<ColumnDef<LeaveRequest>[]>(
    () => [
      {
        accessorKey: "leave_type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("leave_type") as string;
          const reason = row.original.reason;
          return (
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {LEAVE_TYPE_LABELS[type as keyof typeof LEAVE_TYPE_LABELS] || type}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 max-w-[200px] truncate" title={reason}>
                {reason}
              </p>
            </div>
          );
        },
      },
      {
        id: "date_range",
        header: "Date Range",
        cell: ({ row }) => {
          const start = new Date(row.original.start_date);
          const end = new Date(row.original.end_date);
          return (
            <div className="text-[var(--text-secondary)] font-medium">
              <div>{format(start, "MMM d, yyyy")}</div>
              <div className="text-xs text-[var(--text-muted)]">to {format(end, "MMM d, yyyy")}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "days",
        header: "Days",
        cell: ({ row }) => (
          <div className="text-center">
            <span className="bg-white/5 px-3 py-1 rounded-lg border border-white/5 font-bold">
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
            <div className="text-right">
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
            </div>
          );
        },
      },
    ],
    [isCancelling]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 border-l-4 border-[var(--primary)] hover:border-[var(--primary-hover)] transition-colors">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Search className="w-5 h-5 text-[var(--primary)]" />
          <span className="text-[var(--text-primary)]">Filter Records</span>
        </h3>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
          <SelectTrigger className="w-[200px] input-field bg-white/5">
            <SelectValue placeholder="All Requests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <Card className="glass-card-flat border-0 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingSkeleton lines={5} />
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-8">
              <EmptyState 
                title="No records found" 
                description={statusFilter === "all" ? "You haven't applied for any leave yet." : `No ${statusFilter} leave requests found.`}
                icon="📝"
                actionLabel={statusFilter === "all" ? "Apply for Leave" : undefined}
                actionHref="/apply-leave"
              />
            </div>
          ) : (
            <div className="p-6">
              <DataTable 
                columns={columns} 
                data={leaves} 
                searchKey="leave_type" 
                searchPlaceholder="Search leave type..." 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
