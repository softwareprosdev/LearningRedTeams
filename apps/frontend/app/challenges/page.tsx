'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface ChallengeSummary {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  isPublished: boolean;
  _count?: { submissions: number };
}

export default function ChallengesListPage() {
  const [list, setList] = useState<ChallengeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getChallenges();
      if (res.status === 200 && Array.isArray(res.data)) {
        setList(res.data);
      } else {
        setError(res.error || 'Failed to load challenges');
      }
    } catch (err) {
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-neutral-300">Loading challenges...</div></div>);
  if (error) return (<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-red-400">{error}</div></div>);

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="text-gradient-red glow-red">CTF Challenges</span>
              </h1>
              <p className="text-xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
                Test your cybersecurity skills with our Capture The Flag challenges and earn points.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-4">
              <div className="text-sm text-neutral-400">
                <span className="font-semibold text-red-500 glow-red">{list.length}</span> Challenges
              </div>
              <div className="text-sm text-neutral-400">
                <span className="font-semibold text-red-500 glow-red">Multiple</span> Categories
              </div>
              <div className="text-sm text-neutral-400">
                <span className="font-semibold text-red-500 glow-red">Points</span> System
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {list.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 p-16 rounded-2xl text-center">
              <div className="text-6xl mb-4">🏁</div>
              <p className="text-neutral-300 text-lg font-semibold mb-2">No challenges available</p>
              <p className="text-neutral-500">Check back later for new CTF challenges</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((c) => (
                <div key={c.id} className="bg-zinc-950 border border-zinc-800 hover:border-red-600 rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-[1.02] border-glow-red-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{c.title}</h3>
                      <p className="text-sm text-neutral-400 line-clamp-3">{c.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-red-500 font-bold text-lg">{c.points} pts</div>
                      <div className="text-xs text-neutral-500 mt-1">{c.difficulty}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
                    <Link 
                      href={`/challenges/${c.id}`} 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
                    >
                      Start Challenge
                    </Link>
                    <div className="text-xs text-neutral-500">
                      {c.isPublished ? '🟢 Published' : '🔒 Unpublished'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
