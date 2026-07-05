import LandingClient from './LandingClient'

// Enable Incremental Static Regeneration (ISR)
// Revalidates the page on the server every 3600 seconds (1 hour)
export const revalidate = 3600

export const metadata = {
  title: 'LeaveFlow - The Best Leave Management System',
  description: 'Manage your team\'s leave efficiently with LeaveFlow.',
}

export default function Page() {
  return <LandingClient />
}
