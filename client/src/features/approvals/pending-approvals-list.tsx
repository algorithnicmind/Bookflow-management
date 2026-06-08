"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { getPendingRequests, approveLeave, rejectLeave } from "@/services/leaves.service";
import { LeaveRequest } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

function ActionModal({ 
  leave, 
  action, 
  onClose, 
  onSubmit 
}: { 
  leave: LeaveRequest, 
  action: 'approve' | 'reject', 
  onClose: () => void, 
  onSubmit: (id: number, comments: string) => Promise<void> 
}) {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (action === 'reject' && !comments.trim()) {
      toast.error("Comments are required when rejecting a leave request.");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(leave.id, comments);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card p-6 w-full max-w-md relative border border-[var(--glass-border)] shadow-2xl"
      >
        <h3 className="text-xl font-bold mb-4">
          {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
        </h3>
        <div className="mb-4 text-sm text-[var(--text-secondary)]">
          <p><strong>Employee:</strong> {leave.employee_name}</p>
          <p><strong>Type:</strong> {LEAVE_TYPE_LABELS[leave.leave_type]}</p>
          <p><strong>Dates:</strong> {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")} ({leave.days} days)</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Comments {action === 'reject' ? <span className="text-[var(--danger)]">*</span> : <span className="text-[var(--text-muted)]">(Optional)</span>}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="input-field min-h-[100px]"
            placeholder={action === 'approve' ? "Have a great time!" : "Please provide a reason for rejection..."}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="btn-ghost">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className={`px-4 py-2 rounded-md font-semibold text-white transition-all ${
              action === 'approve' ? 'bg-[var(--success)] hover:bg-[var(--success)]/80' : 'bg-[var(--danger)] hover:bg-[var(--danger)]/80'
            }`}
          >
            {isSubmitting ? "Processing..." : action === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function PendingApprovalsList() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<{leave: LeaveRequest, action: 'approve'|'reject'} | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPendingRequests();
      setRequests(data.pending);
    } catch (err) {
      toast.error("Failed to load pending requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleActionSubmit = async (id: number, comments: string) => {
    if (!activeModal) return;
    try {
      if (activeModal.action === 'approve') {
        await approveLeave(id, { comments });
        toast.success("Leave request approved.");
      } else {
        await rejectLeave(id, { comments });
        toast.success("Leave request rejected.");
      }
      setActiveModal(null);
      fetchPending(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${activeModal.action} request.`);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} lines={6} />)}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState 
        title="All caught up!" 
        description="There are no pending leave requests waiting for your approval."
        icon="✨"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((leave, i) => (
        <motion.div
          key={leave.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-5 flex flex-col h-full"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{leave.employee_name}</h3>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{leave.department}</p>
            </div>
            <span className="bg-white/10 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
              {leave.days} days
            </span>
          </div>

          <div className="space-y-3 mb-6 flex-1">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <span>{LEAVE_TYPE_LABELS[leave.leave_type]}</span>
              <span>•</span>
              <span>{format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}</span>
            </div>
            <div className="p-3 bg-white/5 rounded-md border border-[var(--glass-border)] text-sm">
              <p className="text-[var(--text-muted)] text-xs mb-1">Reason:</p>
              <p className="line-clamp-3">{leave.reason}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-auto pt-4 border-t border-[var(--glass-border)]">
            <button 
              onClick={() => setActiveModal({ leave, action: 'reject' })}
              className="flex-1 px-4 py-2 rounded-md font-semibold text-[var(--danger)] bg-[var(--danger)]/10 hover:bg-[var(--danger)]/20 transition-colors"
            >
              Reject
            </button>
            <button 
              onClick={() => setActiveModal({ leave, action: 'approve' })}
              className="flex-1 px-4 py-2 rounded-md font-semibold text-[var(--success)] bg-[var(--success)]/10 hover:bg-[var(--success)]/20 transition-colors"
            >
              Approve
            </button>
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {activeModal && (
          <ActionModal 
            leave={activeModal.leave} 
            action={activeModal.action} 
            onClose={() => setActiveModal(null)} 
            onSubmit={handleActionSubmit} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
