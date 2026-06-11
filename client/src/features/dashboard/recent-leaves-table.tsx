"use client";

import { LeaveRequest } from "@/types/leave.types";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface RecentLeavesTableProps {
  leaves: LeaveRequest[];
}

export function RecentLeavesTable({ leaves }: RecentLeavesTableProps) {
  if (!leaves || leaves.length === 0) {
    return null;
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "annual":
        return "bg-[#083A81]";
      case "sick":
        return "bg-emerald-500";
      case "casual":
      default:
        return "bg-amber-700";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[17px] font-bold text-gray-900">Recent Requests</h3>
        <Link href={ROUTES.LEAVE_HISTORY} className="text-[13px] font-bold text-[#083A81] hover:underline">
          See All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
            <tr>
              <th className="pb-3 font-semibold">TYPE</th>
              <th className="pb-3 font-semibold">DURATION</th>
              <th className="pb-3 font-semibold">STATUS</th>
              <th className="pb-3 font-semibold text-right">APPLIED ON</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.slice(0, 4).map((leave) => {
              const days = differenceInDays(new Date(leave.end_date), new Date(leave.start_date)) + 1;
              
              return (
                <tr key={leave.id} className="group">
                  <td className="py-4 pr-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${getTypeStyle(leave.leave_type)}`} />
                      <div>
                        <p className="font-bold text-gray-900 capitalize text-[14px]">{leave.leave_type} Leave</p>
                        <p className="text-[13px] text-gray-500 max-w-[180px] truncate">{leave.reason || "Personal requirements"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-gray-900 text-[14px]">
                      {format(new Date(leave.start_date), "MMM dd")} - {format(new Date(leave.end_date), "MMM dd")}
                    </p>
                    <p className="text-[13px] text-gray-500">{days} Working Day{days !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-[13px] font-medium text-gray-600">
                      {format(new Date(leave.created_at), "MMM dd, yyyy")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
