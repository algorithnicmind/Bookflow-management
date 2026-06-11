"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ApplyLeaveForm } from "@/features/leaves/apply-leave-form";
import { BalanceCards } from "@/features/dashboard/balance-cards";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { Info, FileText, CalendarOff } from "lucide-react";
import { getLeaveBalance } from "@/services/leaves.service";
import { LeaveBalance } from "@/types/leave.types";

export default function ApplyLeavePage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  
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

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-[1200px] mx-auto text-gray-900"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Balances & Policy (Approx 4/12) */}
        <motion.div variants={staggerItem} className="lg:col-span-4 space-y-8">
          
          {/* Current Balance */}
          <div>
            <BalanceCards balances={balances} />
          </div>

          {/* Leave Policy */}
          <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-[17px] font-bold text-gray-900 mb-5">Leave Policy</h3>
            
            <div className="space-y-5">
              <div className="flex gap-3 items-start">
                <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-[14px]">Notice Period</h4>
                  <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                    Annual leave requests exceeding 3 days must be submitted at least 2 weeks in advance.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <FileText className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-[14px]">Medical Evidence</h4>
                  <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                    Sick leave requests for more than 2 consecutive days require a valid medical certificate upload.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CalendarOff className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 text-[14px]">Blackout Dates</h4>
                  <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                    Dec 20 - Jan 5 are restricted blackout dates due to year-end closing audits.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <h4 className="font-semibold text-[#083A81] text-[13px] mb-1">Need help?</h4>
              <p className="text-[13px] text-[#083A81]/80 leading-snug">
                Talk to our HR advisors regarding special leave categories or policy clarifications.
              </p>
            </div>
          </div>

        </motion.div>

        {/* Right Column: Apply Form (Approx 8/12) */}
        <motion.div variants={staggerItem} className="lg:col-span-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Apply for Leave
            </h1>
            <p className="text-gray-600 text-[15px]">
              Complete the form below to submit your request for approval.
            </p>
          </div>
          
          <ApplyLeaveForm />
        </motion.div>
        
      </div>
    </motion.div>
  );
}
