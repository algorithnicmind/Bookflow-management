"use client";

import { motion } from "framer-motion";
import { DashboardStats } from "@/types/dashboard.types";
import { staggerContainerFast, cardItem, hoverLift } from "@/lib/animations";
import { Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardsProps {
  stats: DashboardStats;
}

// A simple count-up component
function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepTime = Math.max(duration / steps, 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(easeProgress * value));
      
      if (current === steps) clearInterval(timer);
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Leaves",
      value: stats.total_requests,
      icon: FileText,
      color: "blue",
      gradient: "from-blue-500/20 to-indigo-500/5",
      iconBg: "bg-blue-500/10 text-blue-400",
      border: "border-blue-500/10",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "amber",
      gradient: "from-amber-500/20 to-orange-500/5",
      iconBg: "bg-amber-500/10 text-amber-400",
      border: "border-amber-500/10",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "emerald",
      gradient: "from-emerald-500/20 to-teal-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      border: "border-emerald-500/10",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "rose",
      gradient: "from-rose-500/20 to-pink-500/5",
      iconBg: "bg-rose-500/10 text-rose-400",
      border: "border-rose-500/10",
    },
  ];

  return (
    <motion.div
      variants={staggerContainerFast}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {statItems.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardItem}
            whileHover={hoverLift.whileHover}
            whileTap={hoverLift.whileTap}
            className={`relative overflow-hidden rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] p-5 sm:p-6 shadow-sm group`}
          >
            {/* Background Gradient Splash */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.1em] mb-2">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
                    <AnimatedCounter value={stat.value} />
                  </h3>
                </div>
              </div>
              
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
