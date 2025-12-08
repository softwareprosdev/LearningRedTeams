'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'LAB' | 'CHALLENGE';
  order: number;
  textContent?: string;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      slug: string;
    };
  };
  video?: {
    id: string;
    title: string;
    playlistUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  };
  quiz?: {
    id: string;
    passingScore: number;
    timeLimit?: number;
    questions: QuizQuestion[];
  };
  lab?: {
    id: string;
    name: string;
    description: string;
    objectives: any;
    estimatedTime: number;
    hints?: any;
  };
  challenge?: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    points: number;
    hints?: any;
  };
  resources?: any;
  isFreePreview: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: any;
  order: number;
  points: number;
  explanation?: string;
}

export default function LessonViewingPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const response = await apiClient.getLesson(params.lessonId as string);
          if (response.status === 200 && response.data) {
          setLesson(response.data);

          // fetch module lessons so we can compute prev/next navigation
          const moduleId = response.data.module?.id;
          if (moduleId) {
            const moduleResp = await apiClient.getLessonsByModule(moduleId);
            if (moduleResp.status === 200 && Array.isArray(moduleResp.data)) {
              setModuleLessons(moduleResp.data);
              const idx = moduleResp.data.findIndex((l: any) => l.id === response.data.id);
              if (idx !== -1) {
                setPrevLesson(moduleResp.data[idx - 1] || null);
                setNextLesson(moduleResp.data[idx + 1] || null);
              }
            }
          }
          // Start lesson progress tracking
          await apiClient.startLesson(params.lessonId as string);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        setError('Error loading lesson');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.lessonId) {
      fetchLesson();
    }
  }, [params.lessonId, isAuthenticated, router]);

  const handleQuizAnswer = (questionId: string, answer: any) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = () => {
    setShowQuizResults(true);
    // Submit quiz answers to backend
    if (!lesson) return;
    setIsSubmittingQuiz(true);
    apiClient
      .submitQuiz(lesson.id, quizAnswers)
      .then((res) => {
        if (res.status === 200 && res.data) {
          setQuizResult(res.data);
          // if passed, show nice message
          if (res.data.passed) {
            // the progress service will mark lesson complete and award points
            // optionally navigate to next lesson after a short delay
            setTimeout(() => {
              // no-op here; keep the user on page so they can review
            }, 800);
          }
        } else {
          setError(res.error || 'Failed to submit quiz');
        }
      })
      .catch(() => setError('Error submitting quiz'))
      .finally(() => setIsSubmittingQuiz(false));
  };

  const handleMarkComplete = async () => {
    if (!params.lessonId) return;

    try {
      const response = await apiClient.completeLesson(params.lessonId as string);
      if (response.status === 200) {
        alert('Lesson marked as complete!');
      } else {
        alert('Failed to mark lesson as complete');
      }
    } catch (err) {
      alert('Error marking lesson as complete');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Lesson not found'}</p>
          <Link
            href="/courses"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/courses"
              className="hover:text-blue-600 transition"
            >
              Courses
            </Link>
            <span>/</span>
            <Link
              href={`/courses/${lesson.module.course.slug}`}
              className="hover:text-blue-600 transition"
            >
              {lesson.module.course.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{lesson.title}</span>
          </div>
        </div>

        {/* Lesson Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {lesson.title}
              </h1>
              <p className="text-gray-600">
                {lesson.module.title} • {lesson.type}
              </p>
            </div>
            <button
              onClick={handleMarkComplete}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Mark as Complete
            </button>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* VIDEO TYPE */}
          {lesson.type === 'VIDEO' && lesson.video && (
            <div>
              {lesson.video.playlistUrl ? (
                <div className="aspect-video bg-gray-900 rounded-lg mb-6">
                  <video
                    controls
                    className="w-full h-full rounded-lg"
                    poster={lesson.video.thumbnailUrl}
                  >
                    <source src={lesson.video.playlistUrl} type="application/x-mpegURL" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                  <p className="text-gray-500">Video processing or unavailable</p>
                </div>
              )}
              {lesson.video.duration && (
                <p className="text-sm text-gray-600 mb-4">
                  Duration: {Math.floor(lesson.video.duration / 60)} minutes
                </p>
              )}
            </div>
          )}

          {/* TEXT TYPE */}
          {lesson.type === 'TEXT' && (
            <div className="prose max-w-none">
              {lesson.textContent ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.textContent }} />
              ) : (
                <p className="text-gray-500">No content available</p>
              )}
            </div>
          )}

          {/* QUIZ TYPE */}
          {lesson.type === 'QUIZ' && lesson.quiz && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz</h2>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Passing Score: {lesson.quiz.passingScore}%</span>
                  {lesson.quiz.timeLimit && (
                    <span>Time Limit: {lesson.quiz.timeLimit} minutes</span>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {lesson.quiz.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Question {index + 1}: {question.question}
                    </h3>

                    {question.type === 'MULTIPLE_CHOICE' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option: any) => (
                          <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option.id}
                              onChange={(e) =>
                                handleQuizAnswer(question.id, e.target.value)
                              }
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-700">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'TRUE_FALSE' && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value="true"
                            onChange={(e) =>
                              handleQuizAnswer(question.id, e.target.value)
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">True</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value="false"
                            onChange={(e) =>
                              handleQuizAnswer(question.id, e.target.value)
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">False</span>
                        </label>
                      </div>
                    )}

                    {question.type === 'SHORT_ANSWER' && (
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Enter your answer..."
                        onChange={(e) =>
                          handleQuizAnswer(question.id, e.target.value)
                        }
                      />
                    )}

                    {showQuizResults && question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          Explanation:
                        </p>
                        <p className="text-sm text-blue-800">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                    {showQuizResults && quizResult && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Your score: {quizResult.score}% — {quizResult.passed ? 'Passed' : 'Failed'}
                        </p>
                        {quizResult.score === 100 && (
                          <p className="text-sm text-green-800">Perfect score! You earned bonus points.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmittingQuiz}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          )}

          {/* LAB TYPE */}
          {lesson.type === 'LAB' && lesson.lab && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {lesson.lab.name}
              </h2>
              <p className="text-gray-700 mb-6">{lesson.lab.description}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Estimated Time: {lesson.lab.estimatedTime} minutes
                </h3>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Lab Environment
                </h3>
                <p className="text-yellow-800 mb-4">
                  Lab infrastructure is currently under development. Check back soon!
                </p>
                <button
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
                  disabled
                >
                  Start Lab Environment
                </button>
              </div>
            </div>
          )}

          {/* CHALLENGE TYPE */}
          {lesson.type === 'CHALLENGE' && lesson.challenge && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {lesson.challenge.title}
              </h2>
              <p className="text-gray-700 mb-6">{lesson.challenge.description}</p>

              <div className="flex gap-4 mb-6">
                <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold">
                  Difficulty: {lesson.challenge.difficulty}
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                  Points: {lesson.challenge.points}
                </span>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Challenge Platform
                </h3>
                <p className="text-yellow-800 mb-4">
                  Challenge infrastructure is currently under development. Check back soon!
                </p>
                <button
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
                  disabled
                >
                  Launch Challenge
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resources */}
        {lesson.resources && Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resources</h2>
            <div className="space-y-2">
              {lesson.resources.map((resource: any, index: number) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 transition"
                >
                  <span className="text-blue-600">📎</span>
                  <div>
                    <p className="font-semibold text-gray-900">{resource.title}</p>
                    {resource.type && (
                      <p className="text-sm text-gray-600">{resource.type}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => prevLesson && router.push(`/courses/${lesson.module.course.slug}/lessons/${prevLesson.id}`)}
              disabled={!prevLesson}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              ← Previous Lesson
            </button>
            <Link
              href={`/courses/${lesson.module.course.slug}`}
              className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Back to Course
            </Link>
            <button
              onClick={() => nextLesson && router.push(`/courses/${lesson.module.course.slug}/lessons/${nextLesson.id}`)}
              disabled={!nextLesson}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              Next Lesson →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
