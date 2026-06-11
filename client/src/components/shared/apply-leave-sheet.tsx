"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInBusinessDays, parseISO, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PenSquare, Clock, CalendarDays, Send, X } from "lucide-react";

import { applyLeave, getLeaveBalance } from "@/services/leaves.service";
import { LeaveBalance } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { ROUTES } from "@/constants/routes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const leaveSchema = z.object({
  leave_type: z.enum(["casual", "sick", "earned", "unpaid"] as const, {
    message: "Please select a leave type.",
  }),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().min(1, "End date is required."),
  reason: z.string().min(10, "Reason must be at least 10 characters.").max(500, "Reason is too long."),
}).refine((data) => {
  const start = parseISO(data.start_date);
  const end = parseISO(data.end_date);
  return isBefore(start, end) || start.getTime() === end.getTime();
}, {
  message: "End date cannot be before start date.",
  path: ["end_date"],
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface ApplyLeaveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplyLeaveSheet({ open, onOpenChange }: ApplyLeaveSheetProps) {
  const router = useRouter();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type: "casual",
      start_date: "",
      end_date: "",
      reason: "",
    },
  });

  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");
  const leaveType = form.watch("leave_type");

  useEffect(() => {
    if (open) {
      form.reset();
      setDuration(0);
      async function loadBalances() {
        try {
          const res = await getLeaveBalance();
          setBalances(res.balances);
        } catch {
          // silently fail
        }
      }
      loadBalances();
    }
  }, [open, form]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      if (isAfter(end, start) || start.getTime() === end.getTime()) {
        const days = differenceInBusinessDays(end, start) + 1;
        setDuration(days > 0 ? days : 0);
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }
  }, [startDate, endDate]);

  async function onSubmit(data: LeaveFormValues) {
    if (data.leave_type !== "unpaid") {
      const balance = balances.find(b => b.leave_type === data.leave_type);
      if (balance && duration > balance.remaining) {
        toast.error(`You only have ${balance.remaining} days of ${LEAVE_TYPE_LABELS[data.leave_type]} leave remaining.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      await applyLeave(data);
      toast.success("Leave request submitted successfully!");
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to submit leave request.");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedBalance = balances.find(b => b.leave_type === leaveType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 overflow-y-auto bg-[var(--bg-secondary)]/95 backdrop-blur-2xl border-l border-[var(--glass-border)]">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
              <PenSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold gradient-text">Submit Request</SheetTitle>
              <SheetDescription className="text-sm text-[var(--text-secondary)]">
                Apply for a new leave of absence
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Controller
                  name="leave_type"
                  control={form.control}
                  render={({ field }) => (
                    <Select disabled={isLoading} onValueChange={(val) => field.onChange(val || '')} defaultValue={field.value}>
                      <SelectTrigger className="w-full sm:w-[200px] input-field bg-[var(--bg-tertiary)] border-[var(--glass-border)]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="earned">Earned Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {selectedBalance && leaveType !== "unpaid" && (
                  <div className="text-xs px-3 py-1.5 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/20 flex items-center gap-1.5 shrink-0">
                    <span className="text-[var(--text-secondary)]">Balance:</span>
                    <span className="font-bold text-[var(--primary)]">{selectedBalance.remaining}d</span>
                  </div>
                )}
              </div>
              {form.formState.errors.leave_type && (
                <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.leave_type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sheet-start_date">Start Date</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                  <Input
                    {...form.register("start_date")}
                    id="sheet-start_date"
                    type="date"
                    className="input-field pl-9 bg-[var(--bg-tertiary)] border-[var(--glass-border)]"
                    min={format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>
                {form.formState.errors.start_date && (
                  <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.start_date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheet-end_date">End Date</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                  <Input
                    {...form.register("end_date")}
                    id="sheet-end_date"
                    type="date"
                    className="input-field pl-9 bg-[var(--bg-tertiary)] border-[var(--glass-border)]"
                    min={startDate || format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>
                {form.formState.errors.end_date && (
                  <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.end_date.message}</p>
                )}
              </div>
            </div>

            {duration > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-gradient-to-r from-[var(--info)]/20 to-[var(--info)]/5 rounded-xl border border-[var(--info)]/30 text-sm flex items-center gap-3"
              >
                <Clock className="w-4 h-4 shrink-0 text-[var(--info)]" />
                <span className="text-[var(--text-secondary)]">
                  Duration: <strong className="text-[var(--info)]">{duration} business day{duration !== 1 ? 's' : ''}</strong>
                </span>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sheet-reason">Reason</Label>
              <Textarea
                {...form.register("reason")}
                id="sheet-reason"
                className="input-field min-h-[120px] resize-y bg-[var(--bg-tertiary)] border-[var(--glass-border)]"
                placeholder="Please provide a detailed reason..."
                disabled={isLoading}
              />
              <div className="flex justify-between items-start mt-1">
                {form.formState.errors.reason ? (
                  <p className="text-[var(--danger)] text-xs font-semibold">{form.formState.errors.reason.message}</p>
                ) : <span />}
                <p className="text-xs text-[var(--text-muted)]">{form.watch("reason")?.length || 0}/500</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="btn-ghost text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary min-w-[130px]"
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
