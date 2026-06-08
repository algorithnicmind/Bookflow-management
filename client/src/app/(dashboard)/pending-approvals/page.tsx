import { PendingApprovalsList } from "@/features/approvals/pending-approvals-list";

export default function PendingApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Pending Approvals</h1>
        <p className="text-[var(--text-secondary)]">Review and manage leave requests from your team.</p>
      </div>
      
      <PendingApprovalsList />
    </div>
  );
}
