'use client';

import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen bg-black">{children}</main>
    </AuthProvider>
  );
}
