'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface Objective {
  id: string;
  title: string;
  description: string;
  points: number;
}

interface Hint {
  order: number;
  content: string;
}

export default function LabSessionPage() {
  const params = useParams();
  const labId = params.id as string;

  const [lab, setLab] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const loadLab = useCallback(async () => {
    try {
      const response = await apiClient.getLab(labId);
      if (response.status === 200) {
        setLab(response.data);
      }
    } catch (error) {
      console.error('Failed to load lab:', error);
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    loadLab();
  }, [labId, loadLab]);

  useEffect(() => {
    if (session?.status === 'RUNNING' && session?.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(session.expiresAt).getTime();
        const distance = expiry - now;

        if (distance < 0) {
          clearInterval(timer);
          setTimeRemaining('EXPIRED');
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session]);

  const handleStartLab = async () => {
    setStarting(true);
    try {
      const response = await apiClient.startLabSession(labId);
      if (response.status === 200 || response.status === 201) {
        setSession(response.data);
        setCompletedObjectives(response.data.completedObjectives || []);
      }
    } catch (error) {
      console.error('Failed to start lab:', error);
      alert('Failed to start lab session');
    } finally {
      setStarting(false);
    }
  };

  const toggleObjective = (objectiveId: string) => {
    setCompletedObjectives((prev) =>
      prev.includes(objectiveId)
        ? prev.filter((id) => id !== objectiveId)
        : [...prev, objectiveId]
    );
  };

  const handleCompleteLab = async () => {
    if (!confirm('Are you sure you want to complete this lab? This will stop your session.')) {
      return;
    }

    setCompleting(true);
    try {
      const response = await apiClient.completeLab(labId, completedObjectives);
      if (response.status === 200) {
        setSession(response.data);
        alert(`Lab completed! Score: ${response.data.score} points`);
      }
    } catch (error) {
      console.error('Failed to complete lab:', error);
      alert('Failed to complete lab');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-neutral-300">Loading lab...</p>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Lab not found</h1>
          <p className="mt-2 text-neutral-400">The requested lab could not be found.</p>
        </div>
      </div>
    );
  }

  const objectives = lab.objectives as Objective[];
  const hints = (lab.hints || []) as Hint[];

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{lab.name}</h1>
              <p className="mt-2 text-neutral-300">{lab.description}</p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-neutral-500">
                <span>Estimated Time: {lab.estimatedTime} minutes</span>
              </div>
            </div>
            {session?.status === 'RUNNING' && (
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-300">Time Remaining</div>
                <div className="text-2xl font-bold text-red-500">{timeRemaining}</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lab Environment */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Lab Environment</h2>

              {!session ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Lab session not started</h3>
                  <p className="text-neutral-400 mb-6">Click the button below to start your lab session</p>
                  <button
                    onClick={handleStartLab}
                    disabled={starting}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 border-glow-red"
                  >
                    {starting ? 'Starting...' : 'Start Lab Session'}
                  </button>
                </div>
              ) : session.status === 'STOPPED' ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Lab Completed</h3>
                  <p className="text-neutral-300">Score: {session.score} points</p>
                  <p className="text-neutral-300">
                    Objectives Completed: {session.completedObjectives?.length || 0} / {objectives.length}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700" style={{ height: '500px' }}>
                    {session.accessUrl ? (
                      <iframe
                        src={session.accessUrl}
                        className="w-full h-full border-0"
                        title="Lab Environment"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                          <p>Setting up lab environment...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Connection Instructions</h4>
                    <p className="text-sm text-neutral-300">
                      Your lab environment is being prepared. Once ready, you&apos;ll be able to access it through the interface above.
                      Use the objectives checklist to track your progress.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Objectives */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Objectives</h2>
              <div className="space-y-3">
                {objectives.map((objective) => (
                  <div key={objective.id} className="border border-zinc-700 rounded-lg p-3">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={completedObjectives.includes(objective.id)}
                        onChange={() => toggleObjective(objective.id)}
                        disabled={!session || session.status !== 'RUNNING'}
                        className="mt-1 w-4 h-4 text-red-600 border-zinc-600 rounded focus:ring-red-500 bg-zinc-800"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-white">{objective.title}</div>
                        <div className="text-sm text-neutral-400 mt-1">{objective.description}</div>
                        <div className="text-xs text-red-400 mt-1">{objective.points} points</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints */}
            {hints.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Hints</h2>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    {showHints ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showHints && (
                  <div className="space-y-3">
                    {hints.map((hint, index) => (
                      <div key={index} className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
                        <div className="text-sm font-medium text-yellow-400">Hint {hint.order}</div>
                        <div className="text-sm text-neutral-300 mt-1">{hint.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Complete Button */}
            {session?.status === 'RUNNING' && (
              <button
                onClick={handleCompleteLab}
                disabled={completing}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
              >
                {completing ? 'Completing...' : 'Complete Lab'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
