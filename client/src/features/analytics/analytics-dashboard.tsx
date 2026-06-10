"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardResponse, OrgStats } from "@/types/dashboard.types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899'];

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton lines={10} className="p-8" />;
  }

  const orgStats = data?.org_stats;

  if (!orgStats) {
    return (
      <div className="glass-card p-12 text-center">
        <span className="text-5xl mb-4 block">📈</span>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Analytics Data</h2>
        <p className="text-[var(--text-muted)]">Check back later once the organization has more activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Organization Analytics</h1>
        <p className="text-[var(--text-secondary)] mt-1">High-level overview of organization health and leave trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={orgStats.total_employees} icon="👥" delay={0.1} />
        <StatCard title="Total Leave Requests" value={orgStats.total_requests} icon="📋" delay={0.2} />
        <StatCard title="Pending Approvals" value={data.stats.pending} icon="⏳" delay={0.3} />
        <StatCard title="Active Leaves" value={data.team_on_leave_today?.length || 0} icon="🏖️" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Distribution" delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orgStats.department_breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="department"
              >
                {orgStats.department_breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'rgba(17, 19, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#F1F5F9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leave Status Breakdown" delay={0.6}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orgStats.status_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="status" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
              <Tooltip 
                contentStyle={{ background: 'rgba(17, 19, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Leave Trend" delay={0.7} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={orgStats.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
              <Tooltip 
                contentStyle={{ background: 'rgba(17, 19, 38, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, delay }: { title: string; value: number; icon: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 flex items-center justify-between group hover:border-[var(--primary)] transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-[var(--text-muted)] mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{value}</h3>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center text-2xl group-hover:bg-[var(--primary)]/10 transition-colors">
        {icon}
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children, delay, className = "" }: { title: string; children: React.ReactNode; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`glass-card p-6 ${className}`}
    >
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">{title}</h3>
      {children}
    </motion.div>
  );
}
