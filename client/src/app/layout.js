import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from '@/context/AuthContext'
import '@/app.css'

export const metadata = {
  title: 'LeaveFlow - Leave Management System',
  description: 'Enterprise Leave Management System',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
