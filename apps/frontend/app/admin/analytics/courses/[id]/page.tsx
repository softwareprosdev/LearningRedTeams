'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface CourseAnalytics {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
  };
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  avgCompletionTime: number;
  lessonCompletionRates: {
    id: string;
    title: string;
    moduleTitle: string;
    order: number;
    moduleOrder: number;
    completionRate: number;
    completedCount: number;
  }[];
  enrollmentTrend: {
    date: string;
    count: number;
  }[];
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/v1/analytics/courses/${courseId}`);
      if (response.data) {
        setAnalytics(response.data);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Failed to fetch course analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchAnalytics();
    }
  }, [courseId, fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">{error || 'Failed to load analytics data.'}</p>
        <Link
          href="/admin/analytics"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Analytics Dashboard
        </Link>
      </div>
    );
  }

  const maxEnrollments = Math.max(...analytics.enrollmentTrend.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <Link
          href="/admin/analytics"
          className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Analytics
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{analytics.course.title}</h1>
        <p className="mt-2 text-gray-600">Detailed analytics and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalEnrollments}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.completedEnrollments}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.completionRate}%
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.avgCompletionTime}
              </p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
            <div className="bg-indigo-100 rounded-full p-3">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Trend Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Enrollment Trend (Last 90 Days)
        </h2>
        <div className="h-64 flex items-end justify-between space-x-1">
          {analytics.enrollmentTrend.map((day, index) => {
            const height = (day.count / maxEnrollments) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-green-500 hover:bg-green-600 transition-all duration-200 rounded-t"
                  style={{ height: `${height}%`, minHeight: day.count > 0 ? '2px' : '0' }}
                ></div>
                <div className="absolute -top-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {day.count} enrollment{day.count !== 1 ? 's' : ''}
                  <br />
                  {new Date(day.date).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Hover over bars to see details
        </div>
      </div>

      {/* Lesson Completion Rates */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Lesson-by-Lesson Completion Rates</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {analytics.lessonCompletionRates.length > 0 ? (
            analytics.lessonCompletionRates.map((lesson) => (
              <div key={lesson.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <p className="text-sm text-gray-600">{lesson.moduleTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{lesson.completionRate}%</p>
                    <p className="text-xs text-gray-500">
                      {lesson.completedCount} / {analytics.totalEnrollments} students
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${lesson.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No lessons available for this course
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Student Engagement</p>
            <p className="text-3xl font-bold">{analytics.totalEnrollments}</p>
            <p className="text-blue-100 text-xs mt-1">total enrollments</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Success Rate</p>
            <p className="text-3xl font-bold">{analytics.completionRate}%</p>
            <p className="text-blue-100 text-xs mt-1">completion rate</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Time to Complete</p>
            <p className="text-3xl font-bold">{analytics.avgCompletionTime}</p>
            <p className="text-blue-100 text-xs mt-1">days on average</p>
          </div>
        </div>
      </div>
    </div>
  );
}
