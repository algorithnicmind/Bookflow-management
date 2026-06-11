"use client";

import { LeaveBalance } from "@/types/leave.types";
import { Umbrella, PlusSquare, Calendar } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

interface BalanceCardsProps {
  balances: LeaveBalance[];
}

export function BalanceCards({ balances }: BalanceCardsProps) {
  if (!balances || balances.length === 0) {
    return null;
  }

  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case "annual":
        return {
          title: "ANNUAL LEAVE",
          icon: Umbrella,
          color: "text-[#083A81]",
          bg: "bg-[#eef1f6]",
          progressColor: "bg-[#083A81]",
          desc: "allowance remaining",
        };
      case "sick":
        return {
          title: "SICK LEAVE",
          icon: PlusSquare,
          color: "text-emerald-500",
          bg: "bg-emerald-50",
          progressColor: "bg-emerald-500",
          desc: "Used for health & wellness only",
        };
      case "casual":
      default:
        return {
          title: "CASUAL LEAVE",
          icon: Calendar,
          color: "text-amber-600",
          bg: "bg-amber-50",
          progressColor: "bg-amber-600",
          desc: "Short-term personal requirements",
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-bold text-gray-900">Leave Balances</h3>
        <Link href={ROUTES.LEAVE_HISTORY} className="text-[13px] font-bold text-[#083A81] hover:underline">
          View History
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {balances.slice(0, 3).map((balance, i) => {
          const config = getTypeConfig(balance.leave_type);
          const Icon = config.icon;
          const percentage = Math.min(100, Math.max(0, (balance.remaining / balance.total_days) * 100));

          return (
            <div
              key={balance.leave_type}
              className="bg-white border border-gray-200 rounded-2xl p-5 relative overflow-hidden shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-700 uppercase tracking-wide text-[11px] mb-2">
                    {config.title}
                  </h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-gray-900 leading-none">
                      {String(balance.remaining).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-gray-500">
                      / {String(balance.total_days).padStart(2, '0')} Days
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
              </div>

              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden my-4">
                <div
                  className={`h-full rounded-full ${config.progressColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-[13px] text-gray-600 font-medium">
                {balance.leave_type.toLowerCase() === "annual" 
                  ? `${Math.round(percentage)}% of allowance remaining`
                  : config.desc
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
