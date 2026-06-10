"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Check, X, Calendar, User, Clock, AlertCircle } from "lucide-react";

import { getPendingRequests, approveLeave, rejectLeave } from "@/services/leaves.service";
import { LeaveRequest } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ActionModal({ 
  leave, 
  action, 
  isOpen,
  onClose, 
  onSubmit 
}: { 
  leave: LeaveRequest | null, 
  action: 'approve' | 'reject' | null, 
  isOpen: boolean,
  onClose: () => void, 
  onSubmit: (id: number, comments: string) => Promise<void> 
}) {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset comments when modal opens
  useEffect(() => {
    if (isOpen) setComments("");
  }, [isOpen]);

  if (!leave || !action) return null;

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' ? (
              <><Check className="w-5 h-5 text-[var(--success)]" /> Approve Request</>
            ) : (
              <><X className="w-5 h-5 text-[var(--danger)]" /> Reject Request</>
            )}
          </DialogTitle>
          <DialogDescription>
            You are about to {action} {leave.employee_name}'s leave request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-white/5 border border-[var(--glass-border)] rounded-xl p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] flex items-center gap-2"><User className="w-4 h-4"/> Employee</span>
              <span className="font-semibold">{leave.employee_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)] flex items-center gap-2"><Clock className="w-4 h-4"/> Type</span>
              <span className="font-semibold">{LEAVE_TYPE_LABELS[leave.leave_type as keyof typeof LEAVE_TYPE_LABELS] || leave.leave_type}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-2 mt-2">
              <span className="text-[var(--text-muted)] flex items-center gap-2"><Calendar className="w-4 h-4"/> Duration</span>
              <span className="font-semibold">{leave.days} days ({format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d")})</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Comments
              {action === 'reject' ? (
                <span className="text-[var(--danger)]">*</span>
              ) : (
                <span className="text-[var(--text-muted)] font-normal">(Optional)</span>
              )}
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="resize-none"
              placeholder={action === 'approve' ? "Have a great time!" : "Please provide a reason for rejection..."}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={action === 'approve' ? 'bg-[var(--success)] hover:bg-[var(--success)]/80 text-white' : 'bg-[var(--danger)] hover:bg-[var(--danger)]/80 text-white'}
          >
            {isSubmitting ? "Processing..." : action === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((leave, i) => (
        <motion.div
          key={leave.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="h-full"
        >
          <Card className="glass-card-flat h-full flex flex-col border border-[var(--glass-border)]">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                    {leave.employee_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{leave.employee_name || 'Unknown'}</h3>
                    <p className="text-[10px] text-[var(--primary)] font-bold uppercase tracking-wider">{leave.department}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-xs">
                  {leave.days} {leave.days === 1 ? 'day' : 'days'}
                </Badge>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {LEAVE_TYPE_LABELS[leave.leave_type as keyof typeof LEAVE_TYPE_LABELS] || leave.leave_type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}</span>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg border border-[var(--glass-border)] mt-2">
                  <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Reason</p>
                  <p className="text-sm line-clamp-2" title={leave.reason}>{leave.reason}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-[var(--glass-border)]">
                <Button 
                  variant="outline"
                  onClick={() => setActiveModal({ leave, action: 'reject' })}
                  className="flex-1 text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] border-[var(--danger)]/20"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Reject
                </Button>
                <Button 
                  onClick={() => setActiveModal({ leave, action: 'approve' })}
                  className="flex-1 bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20 border-0"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <ActionModal 
        leave={activeModal?.leave || null} 
        action={activeModal?.action || null} 
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)} 
        onSubmit={handleActionSubmit} 
      />
    </div>
  );
}
