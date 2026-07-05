import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/features/auth/AuthContext'
import { Toaster } from 'react-hot-toast'
import JsonLd from '@/components/JsonLd'
import '@/app.css'

export const metadata = {
  title: 'LeaveFlow - Enterprise Leave Management System',
  description: 'Streamline your company\'s leave management, approvals, and reporting with LeaveFlow. The ultimate HR solution.',
  keywords: ['leave management', 'HR software', 'time off tracking', 'employee leave', 'HRIS'],
  authors: [{ name: 'LeaveFlow Team' }],
  openGraph: {
    title: 'LeaveFlow - Enterprise Leave Management System',
    description: 'Streamline your company\'s leave management, approvals, and reporting with LeaveFlow.',
    url: 'https://leaveflow.com',
    siteName: 'LeaveFlow',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeaveFlow - Enterprise Leave Management System',
    description: 'Streamline your company\'s leave management, approvals, and reporting with LeaveFlow.',
  },
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LeaveFlow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Enterprise Leave Management System for streamlining HR processes.",
    "url": "https://leaveflow.com"
  }

  return (
    <html lang="en">
      <head>
        <JsonLd data={structuredData} />
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
