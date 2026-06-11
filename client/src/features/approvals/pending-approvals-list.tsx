"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Check, X, Calendar, User, Clock, AlertCircle, ShieldCheck } from "lucide-react";

import { getPendingRequests, approveLeave, rejectLeave } from "@/services/leaves.service";
import { LeaveRequest } from "@/types/leave.types";
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
import { skeletonPulse } from "@/lib/animations";

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
      <DialogContent className="sm:max-w-[425px] bg-[#0B0F19] border-slate-800 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <div className={`h-1.5 w-full ${action === 'approve' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-white">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action === 'approve' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {action === 'approve' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              {action === 'approve' ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription className="text-white/50 text-sm mt-2">
              You are about to {action} <strong className="text-white">{leave.employee_name}</strong>&apos;s leave request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/40 flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold"><User className="w-3.5 h-3.5"/> Employee</span>
                <span className="font-semibold text-white">{leave.employee_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40 flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold"><Clock className="w-3.5 h-3.5"/> Type</span>
                <span className="font-semibold text-white capitalize">{leave.leave_type} Leave</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 mt-3">
                <span className="text-white/40 flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold"><Calendar className="w-3.5 h-3.5"/> Duration</span>
                <span className="font-semibold text-white">
                  {leave.days} {leave.days === 1 ? 'day' : 'days'} 
                  <span className="text-white/40 ml-2 font-normal text-xs">({format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d")})</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                Comments
                {action === 'reject' ? (
                  <span className="text-rose-400">*</span>
                ) : (
                  <span className="text-white/20 font-medium normal-case tracking-normal">(Optional)</span>
                )}
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="resize-none min-h-[100px] bg-[#111827] border-slate-800 rounded-xl text-white placeholder:text-white/20 focus:ring-1 focus:ring-indigo-500"
                placeholder={action === 'approve' ? "Have a great time off!" : "Please provide a reason for rejection..."}
              />
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <button 
              type="button"
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 font-semibold hover:bg-white/5 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all ${
                action === 'approve' 
                  ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-emerald-500/20' 
                  : 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : action === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </DialogFooter>
        </div>
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
      fetchPending();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || `Failed to ${activeModal.action} request.`);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <motion.div 
            key={i} 
            variants={skeletonPulse} 
            initial="initial" 
            animate="animate" 
            className="h-[300px] w-full bg-white/[0.02] border border-white/[0.04] rounded-2xl"
          />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-[#0B0F19] border border-slate-800 shadow-xl rounded-2xl py-20 px-4">
        <EmptyState 
          title="All caught up!" 
          description="There are no pending leave requests waiting for your approval."
          icon="✨"
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {requests.map((leave, i) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col h-full hover:border-slate-700 transition-colors shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 text-lg">
                    {leave.employee_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight mb-0.5">{leave.employee_name || 'Unknown'}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md w-fit">
                      <ShieldCheck className="w-3 h-3 text-white/40" />
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{leave.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Type</p>
                    <p className="text-sm font-semibold text-white capitalize">{leave.leave_type}</p>
                  </div>
                  <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Duration</p>
                    <p className="text-sm font-bold text-white">{leave.days} <span className="font-medium text-white/50 text-xs">days</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[13px] font-medium text-white/60">
                  <Calendar className="w-4 h-4 text-white/30 shrink-0" />
                  <span>{format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}</span>
                </div>
                
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] mt-2 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30" />
                  <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Reason
                  </p>
                  <p className="text-[13px] text-white/80 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all" title={leave.reason}>
                    &quot;{leave.reason}&quot;
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-5 border-t border-white/[0.06]">
                <button 
                  onClick={() => setActiveModal({ leave, action: 'reject' })}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors text-sm font-bold"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button 
                  onClick={() => setActiveModal({ leave, action: 'approve' })}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors text-sm font-bold"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ActionModal 
        leave={activeModal?.leave || null} 
        action={activeModal?.action || null} 
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)} 
        onSubmit={handleActionSubmit} 
      />
    </>
  );
}
