"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInBusinessDays, parseISO, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, AlertCircle, Sparkles, HeartPulse, Briefcase, Baby, HeartHandshake, CheckCircle2, Clock, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { applyLeave, getLeaveBalance } from "@/services/leaves.service";
import { LeaveBalance } from "@/types/leave.types";
import { ROUTES } from "@/constants/routes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const leaveSchema = z.object({
  leave_type: z.enum(["casual", "sick", "earned", "maternity", "miscarriage", "unpaid"] as const, {
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
  { id: "earned", label: "Annual Leave", desc: "Vacation & personal time", icon: Briefcase },
  { id: "sick", label: "Sick Leave", desc: "Illness & medical visits", icon: HeartPulse },
  { id: "casual", label: "Remote Work", desc: "Working from off-site", icon: Sparkles },
  { id: "unpaid", label: "Other", desc: "Bereavement, jury duty, etc", icon: AlertCircle },
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
      leave_type: "earned",
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

  async function onSubmit(data: LeaveFormValues) {
    setSubmitError(null);
    setIsLoading(true);
    try {
      await applyLeave(data);
      setIsSuccess(true);
      toast.success("Leave request submitted successfully!");
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

  if (isSuccess) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center bg-[#f8fafc] rounded-2xl border border-gray-200">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
        <p className="text-gray-600 max-w-sm">
          Your leave request has been successfully sent to your manager for approval.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
      
      {/* Step 1: Category */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">1. Select Category</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className={`flex flex-col items-start p-5 rounded-xl border transition-all text-left ${
                        isActive 
                          ? "border-[#083A81] ring-1 ring-[#083A81] bg-blue-50/50" 
                          : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'text-[#083A81]' : 'text-gray-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full text-[#083A81] flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <p className={`font-bold text-[15px] mb-1 ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {type.label}
                      </p>
                      <p className="text-[13px] text-gray-500">{type.desc}</p>
                    </button>
                  );
                })}
              </>
            )}
          />
        </div>
        {errors.leave_type && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {errors.leave_type.message}</p>
        )}
      </div>

      {/* Step 2: Dates */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">2. Select Dates</h4>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-gray-900">Start Date</Label>
              <Input
                {...form.register("start_date")}
                type="date"
                className="h-12 bg-white border-gray-300 text-gray-900 focus:border-[#083A81] focus:ring-[#083A81] shadow-sm rounded-lg"
                min={format(new Date(), "yyyy-MM-dd")}
              />
              {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold text-gray-900">End Date</Label>
              <Input
                {...form.register("end_date")}
                type="date"
                className="h-12 bg-white border-gray-300 text-gray-900 focus:border-[#083A81] focus:ring-[#083A81] shadow-sm rounded-lg"
                min={startDate || format(new Date(), "yyyy-MM-dd")}
              />
              {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date.message}</p>}
            </div>

            <div className="p-4 bg-[#f8fafc] border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-[#083A81]" />
              </div>
              <p className="text-[13px] text-gray-600 font-medium">
                Total duration: <span className="font-bold text-gray-900">{duration} days</span> selected.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-[#f8fafc] rounded-2xl p-4 border border-gray-200 shadow-sm hidden md:block">
            <Calendar
              mode="single"
              selected={startDate ? parseISO(startDate) : undefined}
              className="bg-transparent text-gray-900"
              classNames={{
                head_cell: "text-gray-500 font-bold text-[11px] uppercase tracking-wider w-9",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#083A81] [&:has([aria-selected])]:text-white rounded-lg hover:bg-gray-100 transition-colors cursor-pointer",
                day: "h-9 w-9 p-0 font-medium",
                day_selected: "bg-[#083A81] text-white hover:bg-[#062a60] hover:text-white focus:bg-[#083A81] focus:text-white",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-sm font-bold text-gray-900",
              }}
            />
          </div>
        </div>
      </div>

      {/* Step 3: Reason */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">3. Reason Details</h4>
        <Textarea
          {...form.register("reason")}
          className="min-h-[120px] resize-y bg-white border-gray-300 text-gray-900 focus:border-[#083A81] focus:ring-[#083A81] shadow-sm rounded-lg"
          placeholder="Please provide any relevant details about your request..."
        />
        {errors.reason && <p className="text-red-500 text-sm mt-2">{errors.reason.message}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading || duration === 0}
          className="bg-[#083A81] hover:bg-[#062a60] text-white font-medium py-3 px-8 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
        >
          {isLoading ? "Submitting..." : "Submit Request"}
        </button>
      </div>

    </form>
  );
}
