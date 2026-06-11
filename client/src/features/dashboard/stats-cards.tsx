"use client";

import { motion } from "framer-motion";
import { DashboardStats } from "@/types/dashboard.types";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AnimatedCounter } from "@/components/shared/animated-counter";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: "Total Requests",
      value: stats.total_requests,
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      ring: "ring-blue-500/20",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/20",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      ring: "ring-emerald-500/20",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      ring: "ring-rose-500/20",
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            variants={staggerItem}
            className="glass-card p-5 flex items-center justify-between group overflow-hidden relative"
          >
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/[0.03] rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                {card.label}
              </p>
              <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
                <AnimatedCounter value={card.value} duration={1.2} />
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${card.bg} ring-1 ${card.ring} group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
