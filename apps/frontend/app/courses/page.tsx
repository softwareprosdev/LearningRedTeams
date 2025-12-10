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
  category:
    | 'RED_TEAM'
    | 'BLUE_TEAM'
    | 'PURPLE_TEAM'
    | 'GENERAL'
    | 'GOVERNANCE'
    | 'SECURITY_ARCHITECTURE'
    | 'CERTIFICATION'
    | 'EMERGING_TECH';
  price: number;
  isFree: boolean;
  isPublished: boolean;
  duration?: string;
  thumbnail?: string;
}

const difficultyConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
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

const categoryConfig: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  RED_TEAM: { icon: '⚔️', label: 'Red Team', color: 'text-red-400', bgColor: 'from-red-950/50 to-zinc-950' },
  BLUE_TEAM: { icon: '🛡️', label: 'Blue Team', color: 'text-blue-400', bgColor: 'from-blue-950/50 to-zinc-950' },
  PURPLE_TEAM: { icon: '⚡', label: 'Purple Team', color: 'text-purple-400', bgColor: 'from-purple-950/50 to-zinc-950' },
  GENERAL: { icon: '⭐', label: 'General', color: 'text-neutral-400', bgColor: 'from-neutral-950/50 to-zinc-950' },
  GOVERNANCE: { icon: '📋', label: 'Governance', color: 'text-yellow-400', bgColor: 'from-yellow-950/50 to-zinc-950' },
  SECURITY_ARCHITECTURE: { icon: '🏗️', label: 'Security Architecture', color: 'text-cyan-400', bgColor: 'from-cyan-950/50 to-zinc-950' },
  CERTIFICATION: { icon: '🎓', label: 'Certification', color: 'text-amber-400', bgColor: 'from-amber-950/50 to-zinc-950' },
  EMERGING_TECH: { icon: '🚀', label: 'Emerging Tech', color: 'text-pink-400', bgColor: 'from-pink-950/50 to-zinc-950' },
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
        console.log('Starting fetchCourses...');
        const response = await apiClient.getCourses();
        console.log('API response received:', response);

        if (response.status === 200 && response.data) {
          const coursesData = Array.isArray(response.data) ? response.data : [];
          console.log('Setting courses:', coursesData.length);
          setCourses(coursesData);
        } else {
          console.log('API failed:', response.status, response.data);
          setError('Failed to load courses');
        }
      } catch (err) {
        console.error('Error in fetchCourses:', err);
        setError('Error loading courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const difficultyMatch =
      selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-900/30 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-red-400 font-medium">Professional Cybersecurity Training</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
                Master{' '}
                <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                  Cybersecurity
                </span>
                <br />
                <span className="text-neutral-300">From Zero to Expert</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto">
                Learn from industry experts with hands-on courses covering offensive security, defensive operations, and everything in between.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">27+</div>
                <div className="text-sm text-neutral-500">Expert Courses</div>
              </div>
              <div className="h-12 w-px bg-neutral-800"></div>
              <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">8</div>
                <div className="text-sm text-neutral-500">Categories</div>
              </div>
              <div className="h-12 w-px bg-neutral-800"></div>
              <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">300+</div>
                <div className="text-sm text-neutral-500">Hours Content</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
      </section>

      {/* Filters Section */}
      <section className="py-8 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white transition-all duration-200 hover:bg-zinc-900 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white transition-all duration-200 hover:bg-zinc-900 cursor-pointer"
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
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-neutral-300 text-lg">Loading courses...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <div className="bg-red-950/50 border border-red-600 text-red-400 rounded-lg p-8 max-w-2xl mx-auto">
                <p className="text-lg font-semibold mb-2">Unable to Load Courses</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Courses Display */}
          {!isLoading && !error && (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-neutral-400">
                  Showing <span className="font-semibold text-white">{filteredCourses.length}</span>{' '}
                  course
                  {filteredCourses.length !== 1 ? 's' : ''}
                </p>
                {filteredCourses.length === 0 && (
                  <p className="text-sm text-neutral-500">Try adjusting your filters</p>
                )}
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-neutral-300 text-lg font-semibold mb-2">No courses found</p>
                  <p className="text-neutral-500">
                    Try adjusting your category or difficulty filters
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => {
                    const categoryInfo = categoryConfig[course.category] || categoryConfig.GENERAL;
                    const difficultyInfo =
                      difficultyConfig[course.difficulty] || difficultyConfig.BEGINNER;

                    return (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="group block"
                      >
                        <div className="h-full bg-zinc-900/50 border border-zinc-800/50 hover:border-red-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20 hover:-translate-y-1">
                          {/* Course Image */}
                          <div className="relative h-48 bg-zinc-900 overflow-hidden">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${categoryInfo.bgColor} flex items-center justify-center relative`}>
                                <span className="text-6xl opacity-30">{categoryInfo.icon}</span>
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                              </div>
                            )}

                            {/* Overlays */}
                            <div className="absolute top-3 left-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${difficultyInfo.bg} ${difficultyInfo.color} ${difficultyInfo.border} border backdrop-blur-sm`}
                              >
                                {difficultyInfo.label}
                              </span>
                            </div>

                            {course.isFree && (
                              <div className="absolute top-3 right-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-sm">
                                  FREE
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Course Content */}
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">{categoryInfo.icon}</span>
                              <span className={`text-xs font-medium ${categoryInfo.color} uppercase tracking-wide`}>
                                {categoryInfo.label}
                              </span>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors duration-200 line-clamp-2">
                              {course.title}
                            </h3>

                            <p className="text-neutral-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                              <div className="flex items-center gap-3">
                                {course.isFree ? (
                                  <span className="text-base font-bold text-emerald-500">FREE</span>
                                ) : (
                                  <span className="text-base font-bold text-white">
                                    ${(course.price / 100).toFixed(2)}
                                  </span>
                                )}
                                {course.duration && (
                                  <>
                                    <span className="text-neutral-700">•</span>
                                    <span className="text-xs text-neutral-500">
                                      {course.duration}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div className="text-red-500 group-hover:translate-x-1 transition-transform duration-200">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/10 to-black"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-900/30 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm text-red-400 font-medium">Join 10,000+ Students</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">
                Ready to Advance Your
                <br />
                <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  Cybersecurity Career?
                </span>
              </h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Join thousands of professionals mastering cybersecurity skills with expert-led courses and hands-on labs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-900/30"
              >
                Start Learning Today
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/challenges"
                className="inline-flex items-center justify-center px-8 py-4 border border-zinc-700 text-white rounded-lg font-semibold hover:border-red-500 hover:bg-red-950/20 transition-all duration-200"
              >
                Try Free Challenges
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
      </section>
    </main>
  );
}
