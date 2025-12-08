'use client';

import CourseForm from '@/components/admin/CourseForm';

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="mt-2 text-gray-600">Fill in the details below to create a new course</p>
      </div>

      <CourseForm />
    </div>
  );
}
