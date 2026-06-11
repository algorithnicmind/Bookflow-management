"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from "recharts";
import { toast } from "sonner";
import { Download, Users, ClipboardList, Clock, Palmtree, Filter } from "lucide-react";

import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardResponse } from "@/types/dashboard.types";
import { EmptyState } from "@/components/shared/empty-state";
import { skeletonPulse } from "@/lib/animations";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all_time");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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

  const handleExport = () => {
    if (!data?.org_stats) return;

    try {
      const deptData = data.org_stats.department_breakdown;
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Department,Count\n" 
        + deptData.map(e => `${e.department},${e.count}`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `leaveflow_analytics_${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Analytics data exported successfully!");
    } catch (e) {
      toast.error("Failed to export data.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-10 w-48 bg-white/[0.02] rounded-xl" />
          <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-10 w-32 bg-white/[0.02] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <motion.div key={i} variants={skeletonPulse} initial="initial" animate="animate" className="h-[120px] bg-white/[0.02] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <motion.div key={i} variants={skeletonPulse} initial="initial" animate="animate" className="h-[400px] bg-white/[0.02] rounded-2xl" />
          ))}
          <motion.div variants={skeletonPulse} initial="initial" animate="animate" className="h-[400px] bg-white/[0.02] rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const orgStats = data?.org_stats;

  if (!orgStats) {
    return (
      <div className="glass-card-static py-24 px-4">
        <EmptyState 
          title="No Analytics Data" 
          description="Check back later once the organization has more activity."
          icon="📊"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border)] p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 text-[var(--text-secondary)] px-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-widest">Time Range</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="flex-1 sm:w-40 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="this_month" className="bg-[#0d0e18]">This Month</option>
            <option value="last_quarter" className="bg-[#0d0e18]">Last Quarter</option>
            <option value="ytd" className="bg-[#0d0e18]">Year to Date</option>
            <option value="all_time" className="bg-[#0d0e18]">All Time</option>
          </select>
          
          <button 
            onClick={handleExport} 
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/25 shrink-0 text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={orgStats.total_employees} icon={<Users className="w-6 h-6 text-cyan-400" />} delay={0.1} color="cyan" />
        <StatCard title="Total Requests" value={orgStats.total_requests} icon={<ClipboardList className="w-6 h-6 text-indigo-400" />} delay={0.2} color="indigo" />
        <StatCard title="Pending Approvals" value={data.stats.pending} icon={<Clock className="w-6 h-6 text-amber-400" />} delay={0.3} color="amber" />
        <StatCard title="Active Leaves" value={data.team_on_leave_today?.length || 0} icon={<Palmtree className="w-6 h-6 text-emerald-400" />} delay={0.4} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Distribution" delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orgStats.department_breakdown}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="count"
                nameKey="department"
                stroke="transparent"
              >
                {orgStats.department_breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0d0e18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leave Status Breakdown" delay={0.6}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orgStats.status_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="status" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} dy={10} className="capitalize" />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0d0e18', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Leave Trend" delay={0.7} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orgStats.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0d0e18', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, delay, color }: { title: string; value: number; icon: React.ReactNode; delay: number; color: string }) {
  const bgColors: Record<string, string> = {
    cyan: "bg-cyan-500/10",
    indigo: "bg-indigo-500/10",
    amber: "bg-amber-500/10",
    emerald: "bg-emerald-500/10"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="glass-card-static h-full transition-colors hover:border-white/[0.08] group">
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">{title}</p>
            <h3 className="text-3xl font-extrabold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">{value}</h3>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${bgColors[color]} flex items-center justify-center transition-transform group-hover:scale-110`}>
            {icon}
          </div>
        </div>
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
      className={className}
    >
      <div className="glass-card-static h-full flex flex-col hover:border-white/[0.08] transition-colors">
        <div className="p-6 pb-2 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-6 pt-8 flex-1">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
