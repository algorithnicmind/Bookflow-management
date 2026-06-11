"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, X, Clock, Filter, ChevronDown } from "lucide-react";

import { getPendingRequests, approveLeave, rejectLeave } from "@/services/leaves.service";
import { LeaveRequest } from "@/types/leave.types";
import { EmptyState } from "@/components/shared/empty-state";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
      <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-xl rounded-2xl p-0 overflow-hidden text-gray-900">
        <div className={`h-1.5 w-full ${action === 'approve' ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold text-gray-900">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action === 'approve' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {action === 'approve' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              {action === 'approve' ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-2">
              You are about to {action} <strong className="text-gray-900">{leave.employee_name}</strong>&apos;s leave request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                Comments
                {action === 'reject' ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400 font-medium normal-case tracking-normal">(Optional)</span>
                )}
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="resize-none min-h-[100px] bg-white border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-[#083A81]"
                placeholder={action === 'approve' ? "Have a great time off!" : "Please provide a reason for rejection..."}
              />
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <button 
              type="button"
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all text-white ${
                action === 'approve' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? "Processing..." : action === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
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

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual':
      case 'earned':
      case 'vacation':
        return 'bg-blue-100 text-blue-700';
      case 'sick':
        return 'bg-amber-100 text-amber-700';
      case 'casual':
      case 'personal':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getBadgeDotColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual':
      case 'earned':
      case 'vacation':
        return 'bg-blue-500';
      case 'sick':
        return 'bg-amber-500';
      case 'casual':
      case 'personal':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-100 rounded-2xl"></div>
        <div className="h-64 bg-gray-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      
      {/* Top Filter & Stats Block */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Filters */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
          <div className="flex flex-wrap items-end gap-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Department</label>
              <button className="flex items-center justify-between w-40 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                All Departments
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Leave Type</label>
              <button className="flex items-center justify-between w-32 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                All Types
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
              <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button className="px-4 py-1.5 bg-[#083A81] text-white text-sm font-medium rounded-md shadow-sm">
                  Pending
                </button>
                <button className="px-4 py-1.5 text-gray-500 text-sm font-medium hover:text-gray-900 rounded-md transition-colors">
                  History
                </button>
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm font-bold text-[#083A81] ml-auto mb-2 hover:underline transition-all">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="shrink-0 w-full lg:w-72 bg-[#083A81] border border-[#062a60] rounded-2xl p-6 flex flex-col justify-center shadow-md">
          <p className="text-blue-100 text-[13px] font-semibold mb-1">Pending Approvals</p>
          <h2 className="text-white text-3xl font-extrabold tracking-tight mb-3">
            {requests.length} Requests
          </h2>
          <div className="flex items-center gap-1.5 text-blue-200 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            Avg response time: 4h
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-20 px-4">
            <EmptyState 
              title="All caught up!" 
              description="There are no pending leave requests waiting for your approval."
              icon="✨"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200 border-b">
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase tracking-widest py-4 pl-6">Employee Information</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase tracking-widest py-4">Duration & Dates</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase tracking-widest py-4">Type</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase tracking-widest py-4">Quick Status</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-500 uppercase tracking-widest py-4 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((leave) => (
                <TableRow key={leave.id} className="border-gray-100 border-b hover:bg-gray-50 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarFallback className="bg-blue-50 text-[#083A81] font-bold">
                          {leave.employee_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{leave.employee_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 font-medium">{leave.department || 'Employee'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="font-bold text-gray-900 text-sm">
                      {leave.days} {leave.days === 1 ? 'Day' : 'Days'} <span className="font-normal text-gray-500">({leave.days < 1 ? 'Partial' : 'Full-day'})</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getBadgeColor(leave.leave_type)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getBadgeDotColor(leave.leave_type)}`}></span>
                      <span className="capitalize">{leave.leave_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      PENDING
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setActiveModal({ leave, action: 'approve' })}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveModal({ leave, action: 'reject' })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {requests.length > 0 && (
          <div className="border-t border-gray-200 p-4 flex items-center justify-between text-xs text-gray-500 font-medium bg-gray-50">
            <p>Showing {requests.length} of {requests.length} pending requests</p>
            <div className="flex gap-4 items-center">
              <button className="hover:text-gray-900 disabled:opacity-50 transition-colors" disabled>&lt;</button>
              <span className="text-gray-900 font-bold">1</span>
              <button className="hover:text-gray-900 disabled:opacity-50 transition-colors" disabled>&gt;</button>
            </div>
          </div>
        )}
      </div>

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
