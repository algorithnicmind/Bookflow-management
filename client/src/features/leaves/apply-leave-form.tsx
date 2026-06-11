"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInBusinessDays, parseISO, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CalendarDays, ArrowLeft, Send, AlertCircle, Briefcase, HeartPulse, Sparkles, CheckCircle2 } from "lucide-react";

import { applyLeave, getLeaveBalance } from "@/services/leaves.service";
import { LeaveBalance } from "@/types/leave.types";
import { ROUTES } from "@/constants/routes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const LEAVE_TYPES = [
  { id: "casual", label: "Casual Leave", icon: Sparkles, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", activeBg: "bg-blue-500/20" },
  { id: "sick", label: "Sick Leave", icon: HeartPulse, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", activeBg: "bg-rose-500/20" },
  { id: "earned", label: "Earned Leave", icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", activeBg: "bg-emerald-500/20" },
  { id: "unpaid", label: "Unpaid Leave", icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", activeBg: "bg-amber-500/20" },
];

export function ApplyLeaveForm() {
  const router = useRouter();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

  const { errors } = form.formState;

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
        const msg = `You only have ${balance.remaining} days of ${data.leave_type} leave remaining.`;
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
    }

    setIsLoading(true);
    try {
      await applyLeave(data);
      setIsSuccess(true);
      toast.success("Leave request submitted successfully!", {
        duration: 4000,
      });
      setTimeout(() => {
        router.push(ROUTES.LEAVE_HISTORY);
      }, 1500);
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Failed to submit leave request.";
      setSubmitError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  }

  const selectedBalance = balances.find(b => b.leave_type === leaveType);

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-16 flex flex-col items-center justify-center text-center"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 relative"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
        <p className="text-white/50 max-w-sm">
          Your leave request has been successfully sent to your manager for approval.
        </p>
      </motion.div>
    );
  }

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative">
      {/* Error Banner */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-400">Submission Error</p>
              <p className="text-rose-400/80 mt-0.5">{submitError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Leave Type & Dates */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Leave Type Selector */}
          <div className="space-y-3">
            <Label className="text-white/60 uppercase tracking-widest text-xs font-bold">Select Leave Type</Label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Controller
                name="leave_type"
                control={form.control}
                render={({ field }) => (
                  <>
                    {LEAVE_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isActive = field.value === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => field.onChange(type.id)}
                          className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-200 text-left ${
                            isActive 
                              ? `${type.activeBg} ${type.border} ring-2 ring-white/10` 
                              : `bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]`
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${isActive ? type.bg : 'bg-white/5'} flex items-center justify-center mb-3 transition-colors`}>
                            <Icon className={`w-4 h-4 ${isActive ? type.color : 'text-white/40'}`} />
                          </div>
                          <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-white/60'}`}>
                            {type.label}
                          </p>
                        </button>
                      );
                    })}
                  </>
                )}
              />
            </div>
            {errors.leave_type && (
              <p className="text-rose-400 text-xs mt-1 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" /> {errors.leave_type.message}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <Label className="text-white/60 uppercase tracking-widest text-xs font-bold">Duration</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="relative group">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                  <Input
                    {...form.register("start_date")}
                    id="start_date"
                    type="date"
                    className={`h-12 pl-11 bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:bg-white/[0.04] focus:border-indigo-500/50 transition-all ${errors.start_date ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                    min={format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>
                {errors.start_date && (
                  <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> {errors.start_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="relative group">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                  <Input
                    {...form.register("end_date")}
                    id="end_date"
                    type="date"
                    className={`h-12 pl-11 bg-white/[0.02] border-white/[0.06] rounded-xl text-white focus:bg-white/[0.04] focus:border-indigo-500/50 transition-all ${errors.end_date ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                    min={startDate || format(new Date(), "yyyy-MM-dd")}
                    disabled={isLoading}
                  />
                </div>
                {errors.end_date && (
                  <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Duration Estimator */}
          <AnimatePresence>
            {duration > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="p-4 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-xl border border-indigo-500/20 flex items-center gap-3 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-indigo-200/60 uppercase tracking-widest font-semibold mb-0.5">Estimated Duration</p>
                  <p className="text-lg font-bold text-indigo-300">{duration} business days</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Balance & Reason */}
        <div className="lg:col-span-5 space-y-8 flex flex-col h-full">
          
          {/* Balance Widget */}
          <div className="bg-[#090a10] border border-white/[0.04] rounded-2xl p-5 shadow-inner">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Available Balance</h4>
            
            {leaveType === "unpaid" ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-sm text-white/60 font-medium">Unpaid leave does not affect your regular balance.</p>
              </div>
            ) : selectedBalance ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-black text-white">{selectedBalance.remaining}</p>
                  <p className="text-xs text-white/40 mt-1">Days remaining out of {selectedBalance.total_days}</p>
                </div>
                {/* Mini chart */}
                <div className="w-16 h-16 rounded-full border-[6px] border-white/5 flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="29" cy="29" r="26" stroke="currentColor" strokeWidth="6" fill="none" className="text-indigo-500" strokeDasharray={`${(selectedBalance.remaining / selectedBalance.total_days) * 163} 163`} strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-bold text-white">{Math.round((selectedBalance.remaining / selectedBalance.total_days) * 100)}%</span>
                </div>
              </div>
            ) : (
              <div className="h-[72px] flex items-center justify-center">
                <span className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-3 flex-1 flex flex-col">
            <Label htmlFor="reason" className="text-white/60 uppercase tracking-widest text-xs font-bold">Reason for Leave</Label>
            <Textarea
              {...form.register("reason")}
              id="reason"
              className={`flex-1 min-h-[140px] resize-y bg-white/[0.02] border-white/[0.06] rounded-xl text-white placeholder:text-white/20 focus:bg-white/[0.04] focus:border-indigo-500/50 transition-all ${errors.reason ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              placeholder="Provide details about why you need this time off..."
              disabled={isLoading}
            />
            <div className="flex justify-between items-start mt-1">
              {errors.reason ? (
                <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> {errors.reason.message}
                </p>
              ) : <span />}
              <p className="text-[10px] text-white/30 font-medium tracking-widest">
                {form.watch("reason")?.length || 0} / 500
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
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
          className="btn-primary min-w-[160px] h-12 text-[15px]"
        >
          {isLoading ? (
            <>
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </>
          )}
        </button>
      </div>

    </form>
  );
}
