import dynamic from 'next/dynamic'

const OrganizationReportsPage = dynamic(
  () => import('@/features/reports/OrganizationReportsPage'),
  {
    loading: () => (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading reports...
      </div>
    ),
  }
)

export default function Page(props) {
  return <OrganizationReportsPage {...props} />
}
