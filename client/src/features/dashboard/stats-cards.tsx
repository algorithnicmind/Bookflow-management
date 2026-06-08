import { motion } from "framer-motion";
import { DashboardStats } from "@/types/dashboard.types";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Total Requests", value: stats.total_requests, icon: "📋", color: "text-[var(--info)]", bg: "bg-[var(--info)]/10" },
    { label: "Pending", value: stats.pending, icon: "⏳", color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10" },
    { label: "Approved", value: stats.approved, icon: "✅", color: "text-[var(--success)]", bg: "bg-[var(--success)]/10" },
    { label: "Rejected", value: stats.rejected, icon: "❌", color: "text-[var(--danger)]", bg: "bg-[var(--danger)]/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="glass-card p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">{card.label}</p>
            <h3 className="text-2xl font-bold">{card.value}</h3>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${card.bg} ${card.color}`}>
            {card.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
