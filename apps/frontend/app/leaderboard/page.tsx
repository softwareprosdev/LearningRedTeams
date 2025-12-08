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
    if (rank === 1) return { emoji: '🥇', color: 'text-yellow-500' };
    if (rank === 2) return { emoji: '🥈', color: 'text-gray-400' };
    if (rank === 3) return { emoji: '🥉', color: 'text-orange-500' };
    return { emoji: `#${rank}`, color: 'text-gray-600' };
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              <span className="text-6xl">🏆</span>
              <br />
              Leaderboard
            </h1>
            <p className="text-xl text-gray-600">
              See how you stack up against other learners
            </p>
          </div>

          {/* Current User Highlight */}
          {user && leaderboard.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg">
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
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-semibold">Error loading leaderboard</p>
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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                  <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {/* 2nd Place */}
                    <div className="text-center pt-8">
                      <div className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="text-4xl mb-2">🥈</div>
                        <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-gray-700 font-bold">
                          {leaderboard[1].firstName[0]}{leaderboard[1].lastName[0]}
                        </div>
                        <p className="font-bold text-gray-900 text-sm">
                          {leaderboard[1].firstName} {leaderboard[1].lastName}
                        </p>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {leaderboard[1].totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">Level {leaderboard[1].level}</p>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                      <div className="bg-white rounded-lg p-4 shadow-2xl transform scale-110">
                        <div className="text-5xl mb-2">🥇</div>
                        <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-2 flex items-center justify-center text-yellow-900 font-bold text-xl">
                          {leaderboard[0].firstName[0]}{leaderboard[0].lastName[0]}
                        </div>
                        <p className="font-bold text-gray-900">
                          {leaderboard[0].firstName} {leaderboard[0].lastName}
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {leaderboard[0].totalPoints.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Level {leaderboard[0].level}</p>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center pt-8">
                      <div className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="text-4xl mb-2">🥉</div>
                        <div className="w-12 h-12 bg-orange-300 rounded-full mx-auto mb-2 flex items-center justify-center text-orange-900 font-bold">
                          {leaderboard[2].firstName[0]}{leaderboard[2].lastName[0]}
                        </div>
                        <p className="font-bold text-gray-900 text-sm">
                          {leaderboard[2].firstName} {leaderboard[2].lastName}
                        </p>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {leaderboard[2].totalPoints.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">Level {leaderboard[2].level}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of Leaderboard */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Streak
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Courses
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.slice(3).map((entry) => {
                      const rankBadge = getRankBadge(entry.rank);
                      const isCurrentUser = user?.id === entry.userId;

                      return (
                        <tr
                          key={entry.userId}
                          className={`hover:bg-blue-50 transition ${
                            isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
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
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {entry.firstName[0]}{entry.lastName[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {entry.firstName} {entry.lastName}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">
                                {entry.level}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-1">⭐</span>
                              <span className="font-bold text-gray-900">
                                {entry.totalPoints.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-1">🔥</span>
                              <span className="text-gray-700">
                                {entry.currentStreak} days
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-1">📚</span>
                              <span className="text-gray-700">
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
                  <p className="text-gray-600 text-lg">No entries yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
