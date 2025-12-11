'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/courses/admin/all');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/courses/admin/${id}`);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course');
    }
  };

  const handlePublish = async (id: string, isPublished: boolean) => {
    try {
      const endpoint = isPublished ? 'unpublish' : 'publish';
      await apiClient.put(`/api/v1/courses/admin/${id}/${endpoint}`);
      setCourses(courses.map((c) => (c.id === id ? { ...c, isPublished: !isPublished } : c)));
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course');
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 'published') return course.isPublished;
    if (filter === 'draft') return !course.isPublished;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-300">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Course Management</h1>
          <p className="mt-2 text-neutral-400">
            Complete control over your course catalog and content
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center shadow-lg shadow-red-900/30"
        >
          <span className="mr-2">➕</span>
          Create New Course
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            📚 All ({courses.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              filter === 'published'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            ✅ Published ({courses.filter((c) => c.isPublished).length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              filter === 'draft'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/30'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
          >
            📝 Draft ({courses.filter((c) => !c.isPublished).length})
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 overflow-hidden hover:border-red-500/50 transition-all duration-300"
            >
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-red-950/50 to-zinc-950 flex items-center justify-center overflow-hidden relative">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={500}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-6xl opacity-30">📚</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                      course.isPublished
                        ? 'bg-emerald-500/90 text-white border border-emerald-600'
                        : 'bg-yellow-500/90 text-white border border-yellow-600'
                    }`}
                  >
                    {course.isPublished ? '✅ Published' : '📝 Draft'}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-neutral-400">
                      <span className="px-2 py-1 bg-zinc-800/50 rounded text-xs">
                        {course.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-zinc-800/50 rounded text-xs">
                        {course.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm text-neutral-400 mb-6">
                  <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-lg font-bold text-white mb-1">
                      {course._count?.enrollments || 0}
                    </div>
                    <div className="text-xs">Students</div>
                  </div>
                  <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-lg font-bold text-white mb-1">
                      {course._count?.modules || 0}
                    </div>
                    <div className="text-xs">Modules</div>
                  </div>
                  <div className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-lg font-bold text-white mb-1">
                      {course.isFree ? 'FREE' : `$${(course.price / 100).toFixed(2)}`}
                    </div>
                    <div className="text-xs">Price</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-center shadow-lg shadow-red-900/30"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handlePublish(course.id, course.isPublished)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition text-center shadow-lg ${
                      course.isPublished
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-yellow-900/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/30'
                    }`}
                  >
                    {course.isPublished ? '📝 Unpublish' : '✅ Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-4 py-3 border-2 border-red-600 text-red-400 rounded-lg font-medium hover:bg-red-950/20 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm rounded-lg shadow-2xl shadow-red-950/20 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
          <p className="text-neutral-400 mb-6">
            {filter === 'all'
              ? 'Get started by creating your first course'
              : `No ${filter} courses found`}
          </p>
          {filter === 'all' && (
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg shadow-red-900/30"
            >
              <span className="mr-2">➕</span>
              Create First Course
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
