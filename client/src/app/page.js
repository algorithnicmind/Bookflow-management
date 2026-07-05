import LandingClient from './LandingClient'

// Enable Incremental Static Regeneration (ISR)
// Revalidates the page on the server every 3600 seconds (1 hour)
export const revalidate = 3600

export const metadata = {
  title: 'Leaveflow - The Best Leave Management System',
  description: 'Manage your team\'s leave efficiently with Leaveflow.',
  openGraph: {
    title: 'Leaveflow - Modern Leave Management',
    description: 'Streamline your team\'s time-off requests, approvals, and balances with Leaveflow.',
    url: 'https://leaveflow.com',
    siteName: 'Leaveflow',
    type: 'website',
  },
  alternates: {
    canonical: 'https://leaveflow.com',
  }
}

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Leaveflow',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Streamline your team\'s time-off requests, approvals, and balances with Leaveflow.'
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingClient />
    </>
  )
}
