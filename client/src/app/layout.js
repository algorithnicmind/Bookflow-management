import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/features/auth/AuthContext'
import { Toaster } from 'react-hot-toast'
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
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
