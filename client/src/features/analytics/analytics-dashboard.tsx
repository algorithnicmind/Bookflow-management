"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from "recharts";
import { toast } from "sonner";
import { Download, Users, ClipboardList, Clock, Palmtree, Calendar as CalendarIcon, Filter } from "lucide-react";

import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardResponse } from "@/types/dashboard.types";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899'];

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
      // Create a simple CSV of the department breakdown as an example
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
    return <LoadingSkeleton lines={10} className="p-8" />;
  }

  const orgStats = data?.org_stats;

  if (!orgStats) {
    return (
      <Card className="glass-card-flat">
        <CardContent className="p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Analytics Data</h2>
          <p className="text-[var(--text-muted)]">Check back later once the organization has more activity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Organization Analytics</h1>
          <p className="text-[var(--text-secondary)] mt-1">High-level overview of organization health and leave trends.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-[var(--glass-border)] rounded-lg p-1">
            <Filter className="w-4 h-4 text-[var(--text-muted)] ml-2" />
            <Select value={timeRange} onValueChange={(val) => setTimeRange(val || "all_time")}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0 shadow-none h-8 text-sm">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleExport} className="btn-primary h-10">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={orgStats.total_employees} icon={<Users className="w-6 h-6 text-blue-400" />} delay={0.1} />
        <StatCard title="Total Requests" value={orgStats.total_requests} icon={<ClipboardList className="w-6 h-6 text-indigo-400" />} delay={0.2} />
        <StatCard title="Pending Approvals" value={data.stats.pending} icon={<Clock className="w-6 h-6 text-[var(--warning)]" />} delay={0.3} />
        <StatCard title="Active Leaves" value={data.team_on_leave_today?.length || 0} icon={<Palmtree className="w-6 h-6 text-emerald-400" />} delay={0.4} />
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
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="status" stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'rgba(11, 12, 22, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="count" fill="url(#colorBar)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Leave Trend" delay={0.7} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orgStats.monthly_trend}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'rgba(11, 12, 22, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              />
              <Area type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, delay }: { title: string; value: number; icon: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="glass-card h-full transition-colors hover:border-[var(--primary)]/50 group hover:-translate-y-1">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)] mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{value}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-[var(--glass-border)] flex items-center justify-center group-hover:bg-[var(--primary)]/10 group-hover:border-[var(--primary)]/20 transition-all">
            {icon}
          </div>
        </CardContent>
      </Card>
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
      <Card className="glass-card h-full border border-[var(--glass-border)] shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-[var(--text-primary)]">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="pt-4">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
