'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-700 transition-colors duration-200 border-glow-red">
              <span className="text-xl text-white">🛡️</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">
              ZeroDay Institute
            </span>
          </Link>

          {/* Menu */}
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-neutral-300 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-all duration-200 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/courses"
                  className="px-4 py-2 text-neutral-300 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-all duration-200 font-medium"
                >
                  Courses
                </Link>
                <div className="flex items-center space-x-3 pl-4 border-l border-zinc-700 ml-4">
                  <div className="text-sm hidden sm:block">
                    <p className="font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-neutral-400 text-xs">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/courses"
                  className="px-4 py-2 text-neutral-300 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-all duration-200 font-medium"
                >
                  Courses
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-red-500 border border-red-600 rounded-lg hover:bg-red-950/30 transition-all duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md border-glow-red"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
