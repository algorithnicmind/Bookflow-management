"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardResponse } from "@/types/dashboard.types";
import { StatsCards } from "@/features/dashboard/stats-cards";
import { BalanceCards } from "@/features/dashboard/balance-cards";
import { RecentLeavesTable } from "@/features/dashboard/recent-leaves-table";
import { TeamOverview } from "@/features/dashboard/team-overview";
import { useAuthStore } from "@/store/auth-store";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

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
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 glass-card animate-pulse" />
          ))}
        </div>
        <div className="h-48 glass-card animate-pulse" />
        <div className="h-64 glass-card animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-8 text-center text-[var(--danger)]">
        <p className="text-lg">{error || "Failed to load data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Welcome back, {user?.name}</h1>
          <p className="text-[var(--text-secondary)]">Here's what's happening today.</p>
        </div>
        
        <div className="flex gap-3">
          <a href="/leave-history" className="btn-ghost">
            View History
          </a>
          <a href="/apply-leave" className="btn-primary">
            + Apply Leave
          </a>
        </div>
      </div>

      <StatsCards stats={data.stats} />

      {(data.team_pending_count !== undefined || data.team_on_leave_today) && (
        <TeamOverview 
          pendingCount={data.team_pending_count || 0} 
          onLeave={data.team_on_leave_today || []} 
        />
      )}

      {data.org_stats && (
        <div className="glass-card p-6 mb-8 border-l-4 border-[var(--primary)]">
          <h3 className="text-lg font-bold mb-2">Organization Overview</h3>
          <div className="flex gap-8">
            <div>
              <p className="text-sm text-[var(--text-muted)]">Total Employees</p>
              <p className="text-xl font-semibold">{data.org_stats.total_employees}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Total Requests</p>
              <p className="text-xl font-semibold">{data.org_stats.total_requests}</p>
            </div>
          </div>
        </div>
      )}

      <BalanceCards balances={data.balances} />
      
      <RecentLeavesTable leaves={data.recent_leaves} />
    </div>
  );
}
