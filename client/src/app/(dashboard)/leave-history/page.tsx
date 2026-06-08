import { LeaveHistoryTable } from "@/features/leaves/leave-history-table";
import Link from "next/link";

export default function LeaveHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Leave History</h1>
          <p className="text-[var(--text-secondary)]">Track and manage your past and current leave requests.</p>
        </div>
        
        <Link href="/apply-leave" className="btn-primary shrink-0">
          + Apply Leave
        </Link>
      </div>
      
      <LeaveHistoryTable />
    </div>
  );
}
