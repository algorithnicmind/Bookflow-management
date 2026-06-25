import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import '@/app.css'

export const metadata = {
  title: 'LeaveFlow - Leave Management System',
  description: 'Enterprise Leave Management System',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
