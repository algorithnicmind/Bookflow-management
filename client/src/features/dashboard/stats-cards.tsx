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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="glass-card p-6 flex items-center justify-between group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{card.label}</p>
            <h3 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">{card.value}</h3>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner relative z-10 ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
            {card.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
