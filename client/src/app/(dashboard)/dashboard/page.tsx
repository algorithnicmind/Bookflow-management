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
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ROUTES } from "@/constants/routes";
import { PenSquare, CalendarDays, Users, Building2 } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadData() {
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
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-white/5 animate-shimmer" />
          <div className="h-4 w-48 rounded-lg bg-white/5 animate-shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 glass-card-static animate-shimmer rounded-2xl" />
          ))}
        </div>
        <div className="h-48 glass-card-static animate-shimmer rounded-2xl" />
        <div className="h-64 glass-card-static animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card-static p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-lg font-semibold text-[var(--danger)]">{error || "Failed to load data"}</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">
            Welcome back, {user?.name}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Here's what's happening with your leaves today.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={ROUTES.LEAVE_HISTORY} className="btn-ghost text-sm py-2 px-4">
            <CalendarDays className="w-4 h-4" />
            History
          </Link>
          <Link href={ROUTES.APPLY_LEAVE} className="btn-primary text-sm py-2 px-4">
            <PenSquare className="w-4 h-4" />
            Apply Leave
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem}>
        <StatsCards stats={data.stats} />
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

      {/* Org Overview (admins only) */}
      {data.org_stats && (
        <motion.div variants={staggerItem}>
          <div className="glass-card-static p-6 border-l-4 border-[var(--primary)]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--primary)]" />
              Organization Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-[var(--glass-border)]">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">
                  Total Employees
                </p>
                <p className="text-2xl font-bold gradient-text">
                  {data.org_stats.total_employees}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-[var(--glass-border)]">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">
                  Total Requests
                </p>
                <p className="text-2xl font-bold gradient-text">
                  {data.org_stats.total_requests}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-[var(--glass-border)]">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">
                  Departments
                </p>
                <p className="text-2xl font-bold gradient-text">
                  {data.org_stats.department_breakdown?.length || 0}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-[var(--glass-border)]">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">
                  Approval Rate
                </p>
                <p className="text-2xl font-bold gradient-text">
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

      {/* Leave Balances */}
      <motion.div variants={staggerItem}>
        <BalanceCards balances={data.balances} />
      </motion.div>

      {/* Recent Leaves */}
      <motion.div variants={staggerItem}>
        <RecentLeavesTable leaves={data.recent_leaves} />
      </motion.div>
    </motion.div>
  );
}
