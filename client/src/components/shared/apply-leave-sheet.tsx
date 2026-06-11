"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInBusinessDays, parseISO, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarDays, Send, ArrowRight, Loader2, Info } from "lucide-react";

import { applyLeave, getLeaveBalance } from "@/services/leaves.service";
import { LeaveBalance } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";

import { Input } from "@/components/ui/input";
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
  leave_type: z.enum(["casual", "sick", "earned", "maternity", "miscarriage", "unpaid"] as const, {
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
      <SheetContent side="right" className="sm:max-w-[500px] w-full p-0 overflow-y-auto bg-[var(--bg-primary)] border-l border-[var(--border)] shadow-lg">
        <SheetHeader className="p-8 pb-4">
          <SheetTitle className="text-[26px] font-bold text-white tracking-tight">Submit Request</SheetTitle>
          <SheetDescription className="text-[14px] text-[var(--text-secondary)] font-light mt-1">
            Apply for a new leave of absence.
          </SheetDescription>
        </SheetHeader>

        <div className="px-8 pb-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Leave Type */}
            <div className="space-y-2.5">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                Leave Type
              </label>
              <Controller
                name="leave_type"
                control={form.control}
                render={({ field }) => (
                  <Select disabled={isLoading} onValueChange={(val) => field.onChange(val || '')} defaultValue={field.value}>
                    <SelectTrigger className="w-full h-12 bg-[var(--bg-secondary)] border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--bg-secondary)] border-[var(--border)] text-white rounded-lg">
                      {["casual", "sick", "earned", "maternity", "miscarriage", "unpaid"].map((type) => {
                        const bal = balances.find(b => b.leave_type === type);
                        return (
                          <SelectItem key={type} value={type} className="focus:bg-white/5 cursor-pointer">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span>{LEAVE_TYPE_LABELS[type as keyof typeof LEAVE_TYPE_LABELS]}</span>
                              {type !== "unpaid" && bal !== undefined && (
                                <span className="text-xs text-[var(--text-secondary)] font-medium">[{bal.remaining} Days Left]</span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.leave_type && (
                <p className="text-rose-400 text-xs font-medium">{form.formState.errors.leave_type.message}</p>
              )}
            </div>

            {/* Dates (Horizontal Layout) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest w-[45%]">
                  Start Date
                </label>
                <div className="w-[10%]"></div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest w-[45%]">
                  End Date
                </label>
              </div>
              
              <div className="flex items-center justify-between gap-3">
                {/* Start Date */}
                <div className="relative w-full">
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--text-muted)] pointer-events-none" />
                  <Input
                    {...form.register("start_date")}
                    type="date"
                    className="w-full h-12 pl-10 bg-[var(--bg-secondary)] border-[var(--border)] rounded-lg text-[14px] text-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    min={format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>

                <ArrowRight className="w-5 h-5 text-[var(--text-muted)] shrink-0" />

                {/* End Date */}
                <div className="relative w-full">
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--text-muted)] pointer-events-none" />
                  <Input
                    {...form.register("end_date")}
                    type="date"
                    className="w-full h-12 pl-10 bg-[var(--bg-secondary)] border-[var(--border)] rounded-lg text-[14px] text-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    min={startDate || format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {/* Errors for dates */}
              <div className="flex justify-between mt-1.5">
                <div className="w-full">
                  {form.formState.errors.start_date && (
                    <p className="text-rose-400 text-xs font-medium">{form.formState.errors.start_date.message}</p>
                  )}
                </div>
                <div className="w-full">
                  {form.formState.errors.end_date && (
                    <p className="text-rose-400 text-xs font-medium">{form.formState.errors.end_date.message}</p>
                  )}
                </div>
              </div>

              {/* Duration Live Calculation */}
              {duration > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-[13px] font-medium text-[var(--text-secondary)] flex items-center gap-1.5"
                >
                  <Info className="w-4 h-4 text-indigo-400" />
                  Duration: <span className="text-indigo-400 font-bold">{duration} Days</span>
                </motion.div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                Reason
              </label>
              <Textarea
                {...form.register("reason")}
                className="w-full min-h-[120px] bg-[var(--bg-secondary)] border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[var(--text-muted)] focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none"
                placeholder="Type your reason here..."
                disabled={isLoading}
              />
              <div className="flex justify-between items-start mt-1">
                {form.formState.errors.reason ? (
                  <p className="text-rose-400 text-xs font-medium">{form.formState.errors.reason.message}</p>
                ) : <span />}
                <p className="text-xs text-[var(--text-muted)] font-medium">{form.watch("reason")?.length || 0}/500</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-[var(--border)]/50 mt-8">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="px-4 py-2.5 text-[14px] font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="h-[44px] px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span className="text-amber-300">✨</span>
                    Submit Request
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
