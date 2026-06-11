"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInBusinessDays, parseISO, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PenSquare, Clock, CalendarDays, ArrowLeft, Send, AlertCircle } from "lucide-react";

import { applyLeave, getLeaveBalance } from "@/services/leaves.service";
import { LeaveBalance } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { ROUTES } from "@/constants/routes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const leaveSchema = z.object({
  leave_type: z.enum(["casual", "sick", "earned", "unpaid"] as const, {
    message: "Please select a leave type."
  }),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().min(1, "End date is required."),
  reason: z.string().min(10, "Reason must be at least 10 characters long.").max(500, "Reason is too long."),
}).refine((data) => {
  const start = parseISO(data.start_date);
  const end = parseISO(data.end_date);
  return isBefore(start, end) || start.getTime() === end.getTime();
}, {
  message: "End date cannot be before start date.",
  path: ["end_date"],
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

export function ApplyLeaveForm() {
  const router = useRouter();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  const { errors, isSubmitting } = form.formState;

  useEffect(() => {
    async function loadBalances() {
      try {
        const res = await getLeaveBalance();
        setBalances(res.balances);
      } catch (err) {
        console.error("Failed to load balances", err);
      }
    }
    loadBalances();
  }, []);

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

  // Shake form on error
  useEffect(() => {
    if (submitError && formRef.current) {
      formRef.current.classList.add("animate-shake");
      const timer = setTimeout(() => {
        formRef.current?.classList.remove("animate-shake");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  async function onSubmit(data: LeaveFormValues) {
    setSubmitError(null);

    if (data.leave_type !== "unpaid") {
      const balance = balances.find(b => b.leave_type === data.leave_type);
      if (balance && duration > balance.remaining) {
        const msg = `You only have ${balance.remaining} days of ${LEAVE_TYPE_LABELS[data.leave_type]} leave remaining.`;
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
    }

    setIsLoading(true);
    try {
      await applyLeave(data);
      toast.success("Leave request submitted successfully!", {
        duration: 4000,
      });
      router.push(ROUTES.LEAVE_HISTORY);
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Failed to submit leave request.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedBalance = balances.find(b => b.leave_type === leaveType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
          <PenSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold gradient-text tracking-tight">Submit Request</h2>
          <p className="text-[var(--text-secondary)] text-sm font-medium">Apply for a new leave of absence</p>
        </div>
      </div>

      <Card className="glass-card shadow-2xl border-[var(--glass-border)]">
        <CardContent className="p-6 md:p-8">
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Error Banner */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm"
              >
                <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--danger)]">Submission Error</p>
                  <p className="text-[var(--text-secondary)] mt-0.5">{submitError}</p>
                </div>
              </motion.div>
            )}

            {/* Leave Type */}
            <div className="space-y-3">
              <Label>Leave Type</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Controller
                  name="leave_type"
                  control={form.control}
                  render={({ field }) => (
                    <Select disabled={isLoading} onValueChange={(val) => field.onChange(val || '')} defaultValue={field.value}>
                      <SelectTrigger className="w-[200px] input-field bg-[var(--bg-tertiary)] border-[var(--glass-border)] focus:ring-[var(--primary)]/50 transition-all">
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
                  <div className="text-sm px-4 py-2 bg-[var(--primary)]/10 rounded-lg border border-[var(--primary)]/20 shadow-sm flex items-center gap-2">
                    <span className="text-[var(--text-secondary)] font-medium">Available Balance:</span>
                    <span className="font-bold text-[var(--primary)]">{selectedBalance.remaining} days</span>
                  </div>
                )}
              </div>
              {errors.leave_type && (
                <p className="text-[var(--danger)] text-xs mt-1 font-semibold">
                  {errors.leave_type.message}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="start_date">Start Date</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                  <Input
                    {...form.register("start_date")}
                    id="start_date"
                    type="date"
                    className={`input-field pl-9 bg-[var(--bg-tertiary)] border-[var(--glass-border)] focus:ring-[var(--primary)]/50 transition-all ${errors.start_date ? 'border-[var(--danger)]/50 focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : ''}`}
                    min={format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>
                {errors.start_date && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[var(--danger)] text-xs mt-1 font-semibold"
                  >
                    {errors.start_date.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="end_date">End Date</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                  <Input
                    {...form.register("end_date")}
                    id="end_date"
                    type="date"
                    className={`input-field pl-9 bg-[var(--bg-tertiary)] border-[var(--glass-border)] focus:ring-[var(--primary)]/50 transition-all ${errors.end_date ? 'border-[var(--danger)]/50 focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : ''}`}
                    min={startDate || format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>
                {errors.end_date && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[var(--danger)] text-xs mt-1 font-semibold"
                  >
                    {errors.end_date.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Duration Estimator */}
            {duration > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-gradient-to-r from-[var(--info)]/20 to-[var(--info)]/5 text-[var(--info)] rounded-xl border border-[var(--info)]/30 text-sm flex items-center gap-3 shadow-sm"
              >
                <Clock className="w-5 h-5 shrink-0" />
                <span>Estimated duration: <strong className="text-base">{duration} business days</strong></span>
              </motion.div>
            )}

            {/* Reason */}
            <div className="space-y-3">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                {...form.register("reason")}
                id="reason"
                className={`input-field min-h-[140px] resize-y bg-[var(--bg-tertiary)] border-[var(--glass-border)] focus:ring-[var(--primary)]/50 transition-all ${errors.reason ? 'border-[var(--danger)]/50 focus:border-[var(--danger)] focus:ring-[var(--danger)]/20' : ''}`}
                placeholder="Please provide a detailed reason for your leave request..."
                disabled={isLoading}
              />
              <div className="flex justify-between items-start mt-1">
                {errors.reason ? (
                  <p className="text-[var(--danger)] text-xs font-semibold">
                    {errors.reason.message}
                  </p>
                ) : <span />}
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  {form.watch("reason")?.length || 0}/500 characters
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="btn-ghost"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || duration === 0}
                className="btn-primary min-w-[150px]"
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>

          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
