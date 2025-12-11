'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user has admin/instructor role
    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'INSTRUCTOR'];
    if (user && allowedRoles.includes(user.role)) {
      setIsAuthorized(true);
    } else {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-300">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black"></div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
      </div>

      {/* Admin Navigation */}
      <nav className="bg-zinc-900/80 border-b border-zinc-800/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="text-xl font-bold text-red-500 glow-red">
                🔧 Super Admin
              </Link>
              <div className="hidden md:flex space-x-1">
                <Link
                  href="/admin/dashboard"
                  className="text-zinc-300 hover:text-red-400 hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/admin/courses"
                  className="text-zinc-300 hover:text-red-400 hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  📚 Courses
                </Link>
                <Link
                  href="/admin/users"
                  className="text-zinc-300 hover:text-red-400 hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  👥 Users
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-zinc-300 hover:text-red-400 hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  📈 Analytics
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-zinc-300 hover:text-red-400 hover:bg-red-950/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  ⚙️ Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-zinc-400 hover:text-red-400 px-3 py-2 rounded-lg text-sm font-medium border border-zinc-700 hover:border-red-600 transition-all duration-200"
              >
                👤 Student View
              </Link>
              <div className="flex items-center space-x-2 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-zinc-300 font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-zinc-500">({user?.role})</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">{children}</main>
    </div>
  );
}
