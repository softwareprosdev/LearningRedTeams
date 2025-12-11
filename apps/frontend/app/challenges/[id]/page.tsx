'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function ChallengeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();

  const [challenge, setChallenge] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.getChallenge(id);
      if (res.status === 200 && res.data) setChallenge(res.data);
      else setError(res.error || 'Failed to load challenge');
    } catch (err) {
      console.error(err);
      setError('Failed to load challenge');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await apiClient.getUserChallengeSubmissions(id);
      if (res.status === 200 && Array.isArray(res.data)) setSubmissions(res.data);
    } catch (err) {
      // ignore
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchChallenge();
    if (isAuthenticated) fetchSubmissions();
  }, [id, isAuthenticated, fetchChallenge, fetchSubmissions]);

  const handleSubmitFlag = async () => {
    if (!isAuthenticated) return setError('You must be logged in to submit flags');
    setSubmitting(true);
    try {
      const res = await apiClient.submitFlag(id, flag);
      if (res.status === 200 && res.data) {
        setResult(res.data);
        if (res.data.isCorrect) {
          // refresh submissions and challenge (progress + points awarded by backend)
          fetchSubmissions();
          fetchChallenge();
        }
      } else {
        setError(res.error || 'Failed to submit flag');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit flag');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><div className="text-red-600">{error}</div></div>;
  if (!challenge) return <div className="min-h-screen flex items-center justify-center">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
              <p className="mt-2 text-gray-600">{challenge.description}</p>
              {challenge.lesson && (
                <p className="mt-2 text-xs text-gray-500">Part of lesson: {challenge.lesson.title}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{challenge.points} pts</div>
              <div className="text-xs text-gray-500">{challenge.difficulty}</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: challenge.description }} />

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Submit Flag</h3>
              <div className="flex gap-2 items-center">
                <input
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={handleSubmitFlag}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {result && (
                <div className={`mt-4 p-3 rounded ${result.isCorrect ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  <div className="font-semibold">{result.message}</div>
                  <div className="text-xs mt-1">Points: {result.points}</div>
                </div>
              )}

              {/* User submissions */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Your recent submissions</h4>
                <div className="space-y-2">
                  {submissions.length === 0 ? (
                    <div className="text-sm text-gray-500">No submissions yet</div>
                  ) : (
                    submissions.map((s) => (
                      <div key={s.id} className="p-3 border rounded bg-gray-50 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{new Date(s.submittedAt).toLocaleString()}</div>
                          <div className="text-xs text-gray-600">{s.isCorrect ? 'Correct' : 'Incorrect'}</div>
                        </div>
                        <div className="text-sm text-gray-700">{s.points} pts</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-semibold mb-2">Challenge Details</h3>
            <div className="text-sm text-gray-600">
              <p>Category: {challenge.category}</p>
              <p className="mt-1">Difficulty: {challenge.difficulty}</p>
              <p className="mt-1">Points: {challenge.points}</p>
              <p className="mt-1 text-xs text-gray-400">Submissions: {challenge._count?.submissions || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
