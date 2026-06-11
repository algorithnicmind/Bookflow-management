"use client";

import { LeaveRequest } from "@/types/leave.types";
import { Users, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { motion } from "framer-motion";

interface TeamOverviewProps {
  pendingCount: number;
  onLeave: string[];
}

export function TeamOverview({ pendingCount, onLeave }: TeamOverviewProps) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Team Overview
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">What&apos;s happening with your team today</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Pending Action Card */}
        <div className="flex-1 bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/20 rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-amber-500" />
          </div>
          
          <div className="relative z-10">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Action Required</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-black text-white">{pendingCount}</span>
              <span className="text-sm font-medium text-[var(--text-secondary)] mb-1.5">requests pending</span>
            </div>
          </div>
          
          <Link 
            href={ROUTES.PENDING_APPROVALS}
            className="relative z-10 inline-flex items-center gap-2 text-xs font-bold bg-amber-500/20 text-amber-300 py-2.5 px-4 rounded-xl hover:bg-amber-500/30 transition-colors w-fit"
          >
            Review Now
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* On Leave Today Card */}
        <div className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-sm">
          <div className="relative z-10 flex-1">
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">On Leave Today</p>
            
            {onLeave.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-sm text-[var(--text-muted)] font-medium">Everyone is working today.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {onLeave.map((name, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full py-1.5 pl-1.5 pr-4 hover:bg-white/[0.08] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">
                        {name?.split(' ')[0] || "User"}
                      </p>
                      <p className="text-[9px] text-[var(--text-secondary)] mt-0.5 leading-none">
                        On Leave
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
