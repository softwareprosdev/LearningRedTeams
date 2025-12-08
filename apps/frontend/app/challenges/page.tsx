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

  if (loading) return (<div className="min-h-screen flex items-center justify-center"><div>Loading challenges...</div></div>);
  if (error) return (<div className="min-h-screen flex items-center justify-center"><div className="text-red-600">{error}</div></div>);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CTF Challenges</h1>
          <p className="mt-2 text-gray-600">Solve CTF-style challenges and earn points.</p>
        </div>

        {list.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center text-gray-600">No challenges available</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((c) => (
              <div key={c.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{c.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-bold text-lg">{c.points} pts</div>
                    <div className="text-xs text-gray-500 mt-1">{c.difficulty}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Link href={`/challenges/${c.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View</Link>
                  <div className="text-xs text-gray-500">{c.isPublished ? 'Published' : 'Unpublished'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
