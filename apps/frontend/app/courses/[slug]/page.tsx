'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { UserStatsCard } from '@/components/UserStatsCard';

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'LAB' | 'CHALLENGE';
  order: number;
  isFreePreview: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  category: 'RED_TEAM' | 'BLUE_TEAM' | 'PURPLE_TEAM' | 'GENERAL';
  price: number;
  isFree: boolean;
  isPublished: boolean;
  duration?: number;
  thumbnail?: string;
  prerequisites: string[];
  learningOutcomes: string[];
  modules: Module[];
  _count?: {
    enrollments: number;
  };
}

interface Enrollment {
  id: string;
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
}

const difficultyConfig: Record<
  string,
  { color: string; bg: string; border: string; label: string }
> = {
  BEGINNER: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    label: 'Beginner',
  },
  INTERMEDIATE: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    label: 'Intermediate',
  },
  ADVANCED: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    label: 'Advanced',
  },
  EXPERT: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Expert',
  },
};

const categoryConfig: Record<
  string,
  { icon: string; label: string; color: string; bgColor: string }
> = {
  RED_TEAM: {
    icon: '⚔️',
    label: 'Red Team',
    color: 'text-red-400',
    bgColor: 'from-red-950/50 to-zinc-950',
  },
  BLUE_TEAM: {
    icon: '🛡️',
    label: 'Blue Team',
    color: 'text-blue-400',
    bgColor: 'from-blue-950/50 to-zinc-950',
  },
  PURPLE_TEAM: {
    icon: '⚡',
    label: 'Purple Team',
    color: 'text-purple-400',
    bgColor: 'from-purple-950/50 to-zinc-950',
  },
  GENERAL: {
    icon: '⭐',
    label: 'General',
    color: 'text-neutral-400',
    bgColor: 'from-neutral-950/50 to-zinc-950',
  },
};

const lessonTypeIcons: Record<string, string> = {
  VIDEO: '▶',
  TEXT: '📄',
  QUIZ: '❓',
  LAB: '🧪',
  CHALLENGE: '🎯',
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [userStats, setUserStats] = useState<any | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await apiClient.getCourseBySlug(params.slug as string);
        if (response.status === 200 && response.data) {
          setCourse(response.data);

          // If authenticated, check enrollment status
          if (isAuthenticated) {
            const enrollmentResponse = await apiClient.getEnrollmentForCourse(response.data.id);
            if (enrollmentResponse.status === 200 && enrollmentResponse.data) {
              setEnrollment(enrollmentResponse.data);
            }
          }
        } else {
          setError('Course not found');
        }
      } catch (err) {
        setError('Error loading course');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchCourse();
      // fetch user gamification stats if authenticated
      if (isAuthenticated) {
        apiClient
          .getMyStats()
          .then((res) => {
            if (res.status === 200 && res.data) setUserStats(res.data);
          })
          .catch(() => {});
      }
    }
  }, [params.slug, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!course) return;

    setEnrolling(true);
    try {
      const response = await apiClient.enrollCourse(course.id);
      if ((response.status === 201 || response.status === 200) && response.data) {
        setEnrollment(response.data);
        // Navigate to first lesson
        if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
          const firstLesson = course.modules[0].lessons[0];
          router.push(`/courses/${course.slug}/lessons/${firstLesson.id}`);
        }
      } else {
        setError(response.error || 'Failed to enroll');
      }
    } catch (err) {
      setError('Error enrolling in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (!course || !course.modules.length) return;

    // Find first lesson
    const firstLesson = course.modules[0].lessons[0];
    if (firstLesson) {
      router.push(`/courses/${course.slug}/lessons/${firstLesson.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Loading Skeleton */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-8 mb-8">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-20 bg-zinc-700 rounded-full"></div>
                    <div className="h-6 w-24 bg-zinc-700 rounded-full"></div>
                  </div>
                  <div className="h-10 w-3/4 bg-zinc-700 rounded mb-4"></div>
                  <div className="h-4 w-full bg-zinc-700 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-zinc-700 rounded"></div>
                </div>
                <div className="h-8 w-20 bg-zinc-700 rounded ml-8"></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-6 animate-pulse">
                <div className="h-6 w-32 bg-zinc-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-zinc-700 rounded"></div>
                  <div className="h-4 w-5/6 bg-zinc-700 rounded"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-6 animate-pulse">
                <div className="h-6 w-32 bg-zinc-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-zinc-700 rounded"></div>
                  <div className="h-16 bg-zinc-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-900/50 border border-red-800/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {error === 'Course not found' ? 'Course Not Found' : 'Error Loading Course'}
              </h2>
              <p className="text-neutral-400 mb-6">
                {error === 'Course not found'
                  ? "The course you're looking for doesn't exist or has been removed."
                  : error || 'An unexpected error occurred while loading the course.'}
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/courses"
                className="inline-block w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-center shadow-lg shadow-red-900/30"
              >
                Browse All Courses
              </Link>
              <button
                onClick={() => window.history.back()}
                className="block w-full px-6 py-3 border border-zinc-700 text-white rounded-lg font-semibold hover:bg-zinc-800 transition text-center"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black"></div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header Section */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${difficultyConfig[course.difficulty].bg} ${difficultyConfig[course.difficulty].color} ${difficultyConfig[course.difficulty].border} border backdrop-blur-sm`}
                >
                  {difficultyConfig[course.difficulty].label}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 backdrop-blur-sm">
                  {categoryConfig[course.category]?.icon}{' '}
                  {categoryConfig[course.category]?.label || course.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-lg text-neutral-400 mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="flex gap-6 text-sm text-neutral-400 mb-6">
                {course.duration && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Duration:</span>
                    <span>{course.duration} mins</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Lessons:</span>
                  <span>{totalLessons}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Modules:</span>
                  <span>{course.modules.length}</span>
                </div>
                {course._count && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Students:</span>
                    <span>{course._count.enrollments}</span>
                  </div>
                )}
              </div>

              {/* Enrollment Progress */}
              {enrollment && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">Your Progress</span>
                    <span className="text-sm text-neutral-400">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {enrollment ? (
                  <button
                    onClick={handleStartLearning}
                    className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg shadow-red-900/30"
                  >
                    {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-900/30"
                  >
                    {enrolling ? 'Enrolling...' : course.isFree ? 'Enroll for Free' : 'Enroll Now'}
                  </button>
                )}
                <Link
                  href="/courses"
                  className="px-8 py-3 border-2 border-zinc-700 text-white rounded-lg font-semibold hover:border-red-500 hover:bg-red-950/20 transition"
                >
                  Back to Courses
                </Link>
              </div>
            </div>

            {/* Price */}
            <div className="ml-8 text-right">
              {course.isFree ? (
                <div className="text-3xl font-bold text-emerald-500">FREE</div>
              ) : (
                <div className="text-3xl font-bold text-white">
                  ${(course.price / 100).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Prerequisites</h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✓</span>
                      <span className="text-neutral-300">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">What You&apos;ll Learn</h2>
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">✓</span>
                      <span className="text-neutral-300">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-6">
              {userStats && (
                <div className="mb-6">
                  <UserStatsCard stats={userStats} />
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mb-4">Course Content</h2>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="border border-zinc-700/50 rounded-lg">
                    <div className="p-4 bg-zinc-800/50">
                      <h3 className="font-semibold text-white">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm text-neutral-400 mt-1">{module.description}</p>
                      )}
                      <p className="text-xs text-neutral-500 mt-2">
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="divide-y divide-zinc-700/50">
                      {module.lessons.map((lesson) => {
                        const canAccess = enrollment || lesson.isFreePreview;

                        return (
                          <div
                            key={lesson.id}
                            className={`p-3 text-sm transition ${
                              canAccess
                                ? 'hover:bg-zinc-800/50 cursor-pointer'
                                : 'opacity-60 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (canAccess) {
                                router.push(`/courses/${course.slug}/lessons/${lesson.id}`);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-neutral-500">
                                  {lessonTypeIcons[lesson.type]}
                                </span>
                                <span
                                  className={`${canAccess ? 'text-neutral-300' : 'text-neutral-500'}`}
                                >
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.isFreePreview && (
                                  <span className="text-xs text-red-400 font-semibold">
                                    Preview
                                  </span>
                                )}
                                {!canAccess && (
                                  <span className="text-xs text-neutral-500">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
