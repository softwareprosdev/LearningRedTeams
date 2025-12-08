'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.getCourses();
        if (response.status === 200 && Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          setError('Failed to load courses');
        }
      } catch (err) {
        setError('Error loading courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const categoryMatch =
      selectedCategory === 'all' || course.category === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cybersecurity Courses
          </h1>
          <p className="text-lg text-gray-600">
            Learn from industry experts with hands-on labs and real-world scenarios
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="RED_TEAM">🔴 Red Team</option>
                <option value="BLUE_TEAM">🔵 Blue Team</option>
                <option value="PURPLE_TEAM">🟣 Purple Team</option>
                <option value="GENERAL">⚙️ General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading courses...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && !error && (
          <>
            <p className="text-gray-600 mb-6">
              Showing {filteredCourses.length} course
              {filteredCourses.length !== 1 ? 's' : ''}
            </p>

            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">
                  No courses match your filters. Try adjusting your selection.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                  >
                    {course.thumbnail && (
                      <div className="h-40 bg-gray-200 overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {!course.thumbnail && (
                      <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-6xl">
                          {categoryIcons[course.category] || '📚'}
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {course.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            difficultyColors[course.difficulty] ||
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {course.difficulty}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          {categoryIcons[course.category]} {course.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {course.isFree ? (
                          <span className="text-lg font-bold text-green-600">
                            FREE
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            ${(course.price / 100).toFixed(2)}
                          </span>
                        )}
                        {course.duration && (
                          <span className="text-sm text-gray-600">
                            {course.duration} mins
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
