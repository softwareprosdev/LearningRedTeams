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

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-orange-100 text-orange-800',
  EXPERT: 'bg-red-100 text-red-800',
};

const categoryIcons: Record<string, string> = {
  RED_TEAM: '🔴',
  BLUE_TEAM: '🔵',
  PURPLE_TEAM: '🟣',
  GENERAL: '⚙️',
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
        const response = await apiClient.getCourse(params.slug as string);
        if (response.status === 200 && response.data) {
          setCourse(response.data);

          // If authenticated, check enrollment status
          if (isAuthenticated) {
            const enrollmentResponse = await apiClient.getEnrollmentForCourse(
              response.data.id
            );
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
        apiClient.getMyStats().then(res => {
          if (res.status === 200 && res.data) setUserStats(res.data);
        }).catch(() => {});
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading course...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Course not found'}</p>
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

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    difficultyColors[course.difficulty]
                  }`}
                >
                  {course.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  {categoryIcons[course.category]} {course.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>

              {/* Course Stats */}
              <div className="flex gap-6 text-sm text-gray-600 mb-6">
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
                    <span className="text-sm font-semibold text-gray-700">
                      Your Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
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
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {enrolling ? 'Enrolling...' : course.isFree ? 'Enroll for Free' : 'Enroll Now'}
                  </button>
                )}
                <Link
                  href="/courses"
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back to Courses
                </Link>
              </div>
            </div>

            {/* Price */}
            <div className="ml-8 text-right">
              {course.isFree ? (
                <div className="text-3xl font-bold text-green-600">FREE</div>
              ) : (
                <div className="text-3xl font-bold text-gray-900">
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Prerequisites
                </h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  What You'll Learn
                </h2>
                <ul className="space-y-2">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Course Content */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {userStats && (
                <div className="mb-6">
                  <UserStatsCard stats={userStats} />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Course Content
              </h2>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="border rounded-lg">
                    <div className="p-4 bg-gray-50">
                      <h3 className="font-semibold text-gray-900">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {module.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="divide-y">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-3 text-sm hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">
                                {lessonTypeIcons[lesson.type]}
                              </span>
                              <span className="text-gray-700">{lesson.title}</span>
                            </div>
                            {lesson.isFreePreview && (
                              <span className="text-xs text-blue-600 font-semibold">
                                Preview
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
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
