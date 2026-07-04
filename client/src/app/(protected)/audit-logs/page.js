import dynamic from 'next/dynamic'

const AuditLogsPage = dynamic(
  () => import('@/features/audit/AuditLogsPage'),
  {
    loading: () => (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading audit logs...
      </div>
    ),
  }
)

export default function Page(props) {
  return <AuditLogsPage {...props} />
}
