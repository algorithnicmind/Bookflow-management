"use client";

import { LeaveRequest } from "@/types/leave.types";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

interface RecentLeavesTableProps {
  leaves: LeaveRequest[];
}

export function RecentLeavesTable({ leaves }: RecentLeavesTableProps) {
  if (!leaves || leaves.length === 0) {
    return (
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <h3 className="text-lg font-bold mb-4 text-white">Recent Leaves</h3>
        <div className="py-8 text-center bg-white/[0.02] border border-white/[0.04] rounded-2xl">
          <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm font-medium text-white/40">No recent leaves found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-xl p-0 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Recent Leave Requests</h3>
      </div>
      
      {/* Mobile Card View (< 640px) */}
      <div className="sm:hidden flex flex-col gap-px bg-white/[0.04]">
        {leaves.map((leave) => (
          <div key={leave.id} className="bg-[#0b0c15] p-4 group hover:bg-[#10121d] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-bold text-white capitalize">{leave.leave_type} Leave</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Applied on {format(new Date(leave.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <StatusBadge status={leave.status} />
            </div>
            
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 mt-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">From</p>
                <p className="text-xs font-semibold text-white/80">{format(new Date(leave.start_date), "MMM dd, yyyy")}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-right">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">To</p>
                <p className="text-xs font-semibold text-white/80">{format(new Date(leave.end_date), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-widest text-white/40 bg-[#0B0F19] border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Duration</th>
              <th className="px-6 py-4 font-semibold">Applied On</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="font-semibold text-white capitalize">{leave.leave_type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/70">
                  {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-white/50">
                  {format(new Date(leave.created_at), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <StatusBadge status={leave.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
