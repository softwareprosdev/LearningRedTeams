import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'ZeroDay Institute',
  description: 'Cybersecurity Learning Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-black">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
