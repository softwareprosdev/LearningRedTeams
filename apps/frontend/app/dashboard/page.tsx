'use client';

import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-gradient-red glow-red">{user?.firstName}</span>! 👋
            </h1>
            <p className="text-lg text-neutral-300">
              Continue your cybersecurity learning journey
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">📚</div>
                <div>
                  <p className="text-neutral-400 text-sm">Courses Enrolled</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">⏱️</div>
                <div>
                  <p className="text-neutral-400 text-sm">Learning Hours</p>
                  <p className="text-2xl font-bold text-white">0 hrs</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">🏆</div>
                <div>
                  <p className="text-neutral-400 text-sm">Certificates Earned</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Get Started Section */}
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Get Started with Your First Course
            </h2>
            <p className="text-neutral-300 mb-6">
              Explore our comprehensive catalog of cybersecurity courses designed for all skill levels.
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 border-glow-red"
            >
              Browse Courses →
            </Link>
          </div>

          {/* User Info Card */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              Profile Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-neutral-400 text-sm">Full Name</p>
                <p className="text-lg font-semibold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Email</p>
                <p className="text-lg font-semibold text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Role</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {user?.role?.toLowerCase() || 'Student'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
