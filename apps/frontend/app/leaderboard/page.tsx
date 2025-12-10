'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  totalPoints: number;
  level: number;
  currentStreak: number;
  coursesCompleted: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gamification/leaderboard?limit=100`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', color: 'text-yellow-400' };
    if (rank === 2) return { emoji: '🥈', color: 'text-neutral-400' };
    if (rank === 3) return { emoji: '🥉', color: 'text-orange-400' };
    return { emoji: `#${rank}`, color: 'text-neutral-500' };
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-black cyber-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  <span className="text-6xl">🏆</span>
                  <br />
                  <span className="text-gradient-red glow-red">Leaderboard</span>
                </h1>
                <p className="text-xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
                  See how you stack up against other cybersecurity learners
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Current User Highlight */}
          {user && leaderboard.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-2xl shadow-2xl border border-red-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-90 mb-1">Your Rank</p>
                  <p className="text-3xl font-bold">
                    {leaderboard.find((entry) => entry.userId === user.id)?.rank || 'Unranked'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold opacity-90 mb-1">Your Points</p>
                  <p className="text-3xl font-bold">
                    {leaderboard.find((entry) => entry.userId === user.id)?.totalPoints.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-neutral-300">Loading leaderboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-950/50 border border-red-600 rounded-2xl p-6 text-center">
              <p className="text-red-400 font-semibold">Error loading leaderboard</p>
              <p className="text-red-500 text-sm mt-2">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Leaderboard Table */}
          {!loading && !error && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="bg-gradient-to-r from-red-600 to-red-800 p-8">
                  <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {/* 2nd Place */}
                    <div className="text-center pt-8">
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-lg">
                        <div className="text-4xl mb-2">🥈</div>
                        <div className="w-12 h-12 bg-neutral-400 rounded-full mx-auto mb-2 flex items-center justify-center text-neutral-900 font-bold">
                          {leaderboard[1].firstName[0]}{leaderboard[1].lastName[0]}
                        </div>
                        <p className="font-bold text-white text-sm">
                          {leaderboard[1].firstName} {leaderboard[1].lastName}
                        </p>
                        <p className="text-xl font-bold text-red-400 mt-1">
                          {leaderboard[1].totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-400">Level {leaderboard[1].level}</p>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                      <div className="bg-zinc-900 border border-yellow-600 rounded-lg p-4 shadow-2xl transform scale-110 border-glow-red">
                        <div className="text-5xl mb-2">🥇</div>
                        <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center text-yellow-900 font-bold text-xl">
                          {leaderboard[0].firstName[0]}{leaderboard[0].lastName[0]}
                        </div>
                        <p className="font-bold text-white">
                          {leaderboard[0].firstName} {leaderboard[0].lastName}
                        </p>
                        <p className="text-2xl font-bold text-red-400 mt-1">
                          {leaderboard[0].totalPoints.toLocaleString()}
                        </p>
                        <p className="text-sm text-neutral-400">Level {leaderboard[0].level}</p>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center pt-8">
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-lg">
                        <div className="text-4xl mb-2">🥉</div>
                        <div className="w-12 h-12 bg-orange-600 rounded-full mx-auto mb-2 flex items-center justify-center text-orange-900 font-bold">
                          {leaderboard[2].firstName[0]}{leaderboard[2].lastName[0]}
                        </div>
                        <p className="font-bold text-white text-sm">
                          {leaderboard[2].firstName} {leaderboard[2].lastName}
                        </p>
                        <p className="text-xl font-bold text-red-400 mt-1">
                          {leaderboard[2].totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-400">Level {leaderboard[2].level}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of Leaderboard */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-900 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Streak
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Courses
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-950 divide-y divide-zinc-800">
                    {leaderboard.slice(3).map((entry) => {
                      const rankBadge = getRankBadge(entry.rank);
                      const isCurrentUser = user?.id === entry.userId;

                      return (
                        <tr
                          key={entry.userId}
                          className={`hover:bg-zinc-900 transition ${
                            isCurrentUser ? 'bg-zinc-900 border-l-4 border-red-600' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-lg font-bold ${rankBadge.color}`}
                            >
                              {rankBadge.emoji}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {entry.firstName[0]}{entry.lastName[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-white">
                                  {entry.firstName} {entry.lastName}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-red-950/50 text-red-400 font-bold px-3 py-1 rounded-full text-sm border border-red-800">
                                {entry.level}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-1">⭐</span>
                              <span className="font-bold text-white">
                                {entry.totalPoints.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-1">🔥</span>
                              <span className="text-neutral-300">
                                {entry.currentStreak} days
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-1">📚</span>
                              <span className="text-neutral-300">
                                {entry.coursesCompleted}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {leaderboard.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-neutral-300 text-lg">No entries yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
