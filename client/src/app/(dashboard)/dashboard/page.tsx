"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardResponse } from "@/types/dashboard.types";
import { BalanceCards } from "@/features/dashboard/balance-cards";
import { RecentLeavesTable } from "@/features/dashboard/recent-leaves-table";
import { useAuthStore } from "@/store/auth-store";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import { ApplyLeaveSheet } from "@/components/shared/apply-leave-sheet";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="h-[400px] bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[300px] bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-[200px] bg-gray-200 rounded-2xl"></div>
              <div className="h-[200px] bg-[#083A81]/20 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-20">
      
      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (Balances) - Approx 4/12 */}
        <div className="xl:col-span-4 space-y-6">
          <BalanceCards balances={data.balances} />
        </div>

        {/* Right Column - Approx 8/12 */}
        <div className="xl:col-span-8 space-y-6">
          <RecentLeavesTable leaves={data.recent_leaves} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upcoming Holidays Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[17px] font-bold text-gray-900">Upcoming Holidays</h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-[50px] h-[54px] rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#083A81] uppercase tracking-wider">Nov</span>
                    <span className="text-[20px] font-bold text-[#083A81] leading-none mt-0.5">23</span>
                  </div>
                  <div className="mt-1">
                    <h4 className="font-bold text-gray-900 text-[15px]">Thanksgiving Day</h4>
                    <p className="text-[13px] text-gray-500 mt-0.5">Public Holiday • Thursday</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-[50px] h-[54px] rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Dec</span>
                    <span className="text-[20px] font-bold text-gray-900 leading-none mt-0.5">25</span>
                  </div>
                  <div className="mt-1">
                    <h4 className="font-bold text-gray-900 text-[15px]">Christmas Day</h4>
                    <p className="text-[13px] text-gray-500 mt-0.5">Public Holiday • Monday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Snapshot Card */}
            <div className="bg-[#083A81] rounded-2xl shadow-sm p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-[0.03] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10">
                <h3 className="text-[18px] font-bold text-white mb-2">Team Snapshot</h3>
                <p className="text-blue-100 text-[14px]">
                  {(data.team_on_leave_today && data.team_on_leave_today.length > 0) 
                    ? `${data.team_on_leave_today.length} teammate${data.team_on_leave_today.length > 1 ? 's' : ''} currently out on leave.`
                    : "No teammates are currently on leave."}
                </p>
              </div>

              <div className="flex -space-x-2 mt-8 relative z-10">
                {/* Simulated avatars for design fidelity */}
                <div className="w-10 h-10 rounded-full border-2 border-[#083A81] bg-gray-200 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=11" alt="Team member" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#083A81] bg-gray-200 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=5" alt="Team member" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#083A81] bg-gray-200 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=33" alt="Team member" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#083A81] bg-white flex items-center justify-center">
                  <span className="text-[#083A81] text-[11px] font-bold">+2</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#083A81] hover:bg-[#062a60] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(8,58,129,0.4)] hover:shadow-[0_8px_30px_rgb(8,58,129,0.6)] transition-all hover:scale-105 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <ApplyLeaveSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
