import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function TeamOverview({ pendingCount, onLeave }: { pendingCount: number, onLeave: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Pending Approvals Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-card p-5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <span className="bg-[var(--warning)]/20 text-[var(--warning)] px-2 py-1 rounded text-xs font-bold">
            {pendingCount}
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          You have {pendingCount} leave request{pendingCount !== 1 ? 's' : ''} waiting for your review.
        </p>
        <Link href={ROUTES.PENDING_APPROVALS} className="text-sm text-[var(--primary)] hover:underline">
          View all pending →
        </Link>
      </motion.div>

      {/* Team on Leave Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass-card p-5"
      >
        <h3 className="text-lg font-semibold mb-4">Team on Leave Today</h3>
        {onLeave.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No team members are on leave today.</p>
        ) : (
          <ul className="space-y-2">
            {onLeave.map((name, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center text-xs font-bold">
                  {name.charAt(0)}
                </div>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
