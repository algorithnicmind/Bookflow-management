"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardResponse } from "@/types/dashboard.types";
import { StatsCards } from "@/features/dashboard/stats-cards";
import { BalanceCards } from "@/features/dashboard/balance-cards";
import { RecentLeavesTable } from "@/features/dashboard/recent-leaves-table";
import { TeamOverview } from "@/features/dashboard/team-overview";
import { useAuthStore } from "@/store/auth-store";
import { staggerContainer, staggerItem, pageTransition, skeletonPulse } from "@/lib/animations";
import { ROUTES } from "@/constants/routes";
import { PenSquare, CalendarDays, Building2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { ApplyLeaveSheet } from "@/components/shared/apply-leave-sheet";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="space-y-3">
            <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-8 w-64 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]" />
            <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-4 w-48 rounded-lg bg-[var(--bg-secondary)]" />
          </div>
          <div className="flex gap-2">
            <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-10 w-24 rounded-xl bg-[var(--bg-secondary)]" />
            <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-10 w-32 rounded-xl bg-[var(--primary)]/20" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div key={i} variants={skeletonPulse} initial="initial" animate="animate" className="h-[120px] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]" />
          ))}
        </div>
        <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-[200px] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]" />
        <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-[300px] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div 
        variants={pageTransition} initial="hidden" animate="visible" exit="exit"
        className="flex flex-col items-center justify-center py-20 px-4 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-[var(--danger-bg)] flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-[var(--danger)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Unable to load dashboard</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-md">{error || "We couldn't fetch your data. Please check your connection and try again."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Page
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl lg:text-[28px] font-extrabold text-[var(--text-primary)] flex items-center gap-2.5 tracking-tight mb-1.5">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px]">
            Here&apos;s what&apos;s happening with your team today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={ROUTES.LEAVE_HISTORY} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-tertiary)] transition-colors shadow-sm">
            <CalendarDays className="w-4 h-4" />
            History
          </Link>
          <button onClick={() => setSheetOpen(true)} className="btn-primary flex-1 sm:flex-none justify-center">
            <PenSquare className="w-4 h-4" />
            Apply Leave
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem}>
        <StatsCards stats={data.stats} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Recent Leaves */}
          <motion.div variants={staggerItem}>
            <RecentLeavesTable leaves={data.recent_leaves} />
          </motion.div>
          
          {/* Org Overview (admins only) */}
          {data.org_stats && (
            <motion.div variants={staggerItem}>
              <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[var(--info-bg)] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[var(--info)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">Organization Overview</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Global company statistics</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-bold mb-2">Total Staff</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{data.org_stats.total_employees}</p>
                  </div>
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-bold mb-2">Requests</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{data.org_stats.total_requests}</p>
                  </div>
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.1em] font-bold mb-2">Depts</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{data.org_stats.department_breakdown?.length || 0}</p>
                  </div>
                  <div className="bg-[var(--info-bg)] rounded-xl p-5 border border-[var(--info)]/20 shadow-sm">
                    <p className="text-[10px] text-[var(--info)] uppercase tracking-[0.1em] font-bold mb-2">Approval Rate</p>
                    <p className="text-2xl font-bold text-[var(--info)]">
                      {data.org_stats.status_breakdown
                        ? `${Math.round(
                            ((data.org_stats.status_breakdown.find((s) => s.status === "approved")?.count || 0) /
                              Math.max(data.org_stats.total_requests, 1)) *
                              100
                          )}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6 lg:space-y-8">
          {/* Leave Balances */}
          <motion.div variants={staggerItem}>
            <BalanceCards balances={data.balances} />
          </motion.div>

          {/* Team Overview (managers only) */}
          {(data.team_pending_count !== undefined || data.team_on_leave_today) && (
            <motion.div variants={staggerItem}>
              <TeamOverview
                pendingCount={data.team_pending_count || 0}
                onLeave={data.team_on_leave_today || []}
              />
            </motion.div>
          )}
        </div>
      </div>

      <ApplyLeaveSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </motion.div>
  );
}
