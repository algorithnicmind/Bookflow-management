"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInBusinessDays, parseISO, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { applyLeave, getLeaveBalance } from "@/services/leaves.service";
import { LeaveBalance } from "@/types/leave.types";
import { LEAVE_TYPE_LABELS } from "@/constants/leave-types";
import { ROUTES } from "@/constants/routes";

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
      router.push(ROUTES.LEAVE_HISTORY);
    } catch (error: any) {
      console.error("Failed to submit leave:", error);
      toast.error(error.response?.data?.detail || "Failed to submit leave request.");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedBalance = balances.find(b => b.leave_type === leaveType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 md:p-8 max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold mb-6">Submit Leave Request</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Leave Type
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <select
                {...form.register("leave_type")}
                className="input-field max-w-xs"
                disabled={isLoading}
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="earned">Earned Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
              
              {selectedBalance && leaveType !== "unpaid" && (
                <div className="text-sm px-3 py-1.5 bg-white/5 rounded-md border border-[var(--glass-border)]">
                  <span className="text-[var(--text-muted)]">Available Balance: </span>
                  <span className="font-bold text-[var(--primary)]">{selectedBalance.remaining} days</span>
                </div>
              )}
            </div>
            {form.formState.errors.leave_type && (
              <p className="text-[var(--danger)] text-xs mt-1">
                {form.formState.errors.leave_type.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Start Date
              </label>
              <input
                {...form.register("start_date")}
                type="date"
                className="input-field"
                min={format(new Date(), "yyyy-MM-dd")}
                disabled={isLoading}
              />
              {form.formState.errors.start_date && (
                <p className="text-[var(--danger)] text-xs mt-1">
                  {form.formState.errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                End Date
              </label>
              <input
                {...form.register("end_date")}
                type="date"
                className="input-field"
                min={startDate || format(new Date(), "yyyy-MM-dd")}
                disabled={isLoading}
              />
              {form.formState.errors.end_date && (
                <p className="text-[var(--danger)] text-xs mt-1">
                  {form.formState.errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          {duration > 0 && (
            <div className="p-3 bg-[var(--info)]/10 text-[var(--info)] rounded-md border border-[var(--info)]/20 text-sm flex items-center gap-2">
              <span>⏱️</span>
              <span>Estimated duration: <strong>{duration} business days</strong></span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Reason
            </label>
            <textarea
              {...form.register("reason")}
              className="input-field min-h-[120px] resize-y"
              placeholder="Please provide a valid reason for your leave request..."
              disabled={isLoading}
            />
            {form.formState.errors.reason && (
              <p className="text-[var(--danger)] text-xs mt-1">
                {form.formState.errors.reason.message}
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-1 text-right">
              {form.watch("reason").length}/500 characters
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--glass-border)]">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || duration === 0}
            className="btn-primary min-w-[120px] flex justify-center items-center h-10"
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
