import { ApplyLeaveForm } from "@/features/leaves/apply-leave-form";

export default function ApplyLeavePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Apply for Leave</h1>
        <p className="text-[var(--text-secondary)]">Submit a new leave request for approval.</p>
      </div>
      
      <ApplyLeaveForm />
    </div>
  );
}
