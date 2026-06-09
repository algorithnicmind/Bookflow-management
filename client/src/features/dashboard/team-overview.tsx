import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function TeamOverview({ pendingCount, onLeave }: { pendingCount: number, onLeave: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {/* Pending Approvals Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-card p-8 group hover:border-[var(--warning)]/30 transition-colors relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--warning)]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">⏳</span>
              <span className="text-[var(--text-primary)]">Pending Approvals</span>
            </h3>
          </div>
          <span className="bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-[var(--warning)] px-3 py-1.5 rounded-lg text-sm font-black shadow-sm">
            {pendingCount}
          </span>
        </div>
        <p className="text-[var(--text-secondary)] mb-6 font-medium relative z-10">
          You have <strong className="text-[var(--text-primary)]">{pendingCount}</strong> leave request{pendingCount !== 1 ? 's' : ''} waiting for your review.
        </p>
        <Link href={ROUTES.PENDING_APPROVALS} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--warning)] hover:text-yellow-400 transition-colors relative z-10">
          <span>Review now</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </motion.div>

      {/* Team on Leave Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
          <span className="text-2xl">🏖️</span>
          <span className="text-[var(--text-primary)]">Team on Leave Today</span>
        </h3>
        
        <div className="relative z-10">
          {onLeave.length === 0 ? (
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
              <p className="text-sm font-medium text-[var(--text-muted)]">No team members are on leave today.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {onLeave.map((name, i) => (
                <li key={i} className="flex items-center gap-4 text-sm bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                    {name.charAt(0)}
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}
