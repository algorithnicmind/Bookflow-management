"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";
import { Bell, Settings, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Topbar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  if (!user) return null;

  const isLeaveRoute = pathname.includes("leave-history") || pathname.includes("apply-leave");
  const isReportsRoute = pathname.includes("analytics");
  const isApprovalsRoute = pathname.includes("pending-approvals");

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-8 h-16">
        
        {/* Left Section: Title */}
        <div className="flex items-center w-[200px]">
          {isApprovalsRoute ? (
            <h2 className="text-[17px] font-bold text-[#083A81]">Manager Approvals</h2>
          ) : (
            <h2 className="text-[17px] font-bold text-[#083A81]">HRPortal LMS</h2>
          )}
        </div>

        {/* Middle Section: Tabs or Search */}
        <div className="flex-1 flex items-center justify-start ml-8">
          {isLeaveRoute ? (
            <nav className="flex space-x-8 h-full items-center">
              <Link 
                href={ROUTES.APPLY_LEAVE}
                className={`text-[14px] font-medium h-16 flex items-center border-b-2 px-1 ${
                  pathname === ROUTES.APPLY_LEAVE ? "border-[#083A81] text-[#083A81]" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                New Request
              </Link>
              <Link 
                href={ROUTES.LEAVE_HISTORY}
                className={`text-[14px] font-medium h-16 flex items-center border-b-2 px-1 ${
                  pathname === ROUTES.LEAVE_HISTORY ? "border-[#083A81] text-[#083A81]" : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                My History
              </Link>
            </nav>
          ) : isReportsRoute ? (
            <nav className="flex space-x-8 h-full items-center">
              <button className="text-[14px] font-medium h-16 flex items-center border-b-2 px-1 border-transparent text-gray-500 hover:text-gray-900">
                Overview
              </button>
              <Link 
                href={ROUTES.ANALYTICS}
                className="text-[14px] font-medium h-16 flex items-center border-b-2 px-1 border-[#083A81] text-[#083A81]"
              >
                Analytics
              </Link>
              <button className="text-[14px] font-medium h-16 flex items-center border-b-2 px-1 border-transparent text-gray-500 hover:text-gray-900">
                Logs
              </button>
            </nav>
          ) : (
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={isApprovalsRoute ? "Search by name..." : "Search employees or policies..."}
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center justify-end gap-5 w-[300px]">
          <button className="text-gray-500 hover:text-[#083A81] transition-colors relative">
            <Bell className="w-5 h-5" />
            {isApprovalsRoute && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
          </button>
          
          <button className="text-gray-500 hover:text-[#083A81] transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold text-gray-900 leading-none mb-1">{user.name}</p>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide leading-none">{user.department}</p>
            </div>
            <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
              <AvatarFallback className="bg-[#083A81] text-white text-xs">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

      </div>
    </header>
  );
}
