import type { Metadata } from 'next';
import './globals.css';
import { ClientWrapper } from '@/components/client-wrapper';

export const metadata: Metadata = {
  title: 'ZeroDay Institute',
  description: 'Cybersecurity Learning Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white min-h-screen">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
