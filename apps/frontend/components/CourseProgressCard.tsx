import Link from 'next/link';
import ProgressBar from './ProgressBar';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  difficulty: string;
  category: string;
  duration?: number;
}

interface Enrollment {
  id: string;
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  course: Course;
}

interface CourseProgressCardProps {
  enrollment: Enrollment;
}

export default function CourseProgressCard({ enrollment }: CourseProgressCardProps) {
  const { course, progress, completedAt, lastAccessedAt } = enrollment;

  const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-800',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
    ADVANCED: 'bg-orange-100 text-orange-800',
    EXPERT: 'bg-red-100 text-red-800',
  };

  const categoryColors = {
    RED_TEAM: 'bg-red-100 text-red-800',
    BLUE_TEAM: 'bg-blue-100 text-blue-800',
    PURPLE_TEAM: 'bg-purple-100 text-purple-800',
    GENERAL: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatus = () => {
    if (completedAt) {
      return (
        <div className="flex items-center text-green-600">
          <svg
            className="w-5 h-5 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (progress > 0) {
      return (
        <div className="text-blue-600">
          <span className="text-sm font-medium">In Progress</span>
        </div>
      );
    } else {
      return (
        <div className="text-gray-600">
          <span className="text-sm font-medium">Not Started</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <Link href={`/courses/${course.slug}`}>
        <div className="cursor-pointer">
          {/* Thumbnail */}
          {course.thumbnail ? (
            <div className="relative h-48 w-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <div className="text-white text-4xl">🎓</div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                  {course.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {course.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    difficultyColors[course.difficulty as keyof typeof difficultyColors] ||
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {course.difficulty}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    categoryColors[course.category as keyof typeof categoryColors] ||
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {course.category.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <ProgressBar progress={progress} size="md" />
            </div>

            {/* Status and Info */}
            <div className="flex items-center justify-between text-sm">
              {getStatus()}
              <div className="text-gray-500">
                Last accessed: {formatDate(lastAccessedAt)}
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-4">
              <div className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center">
                {completedAt ? 'Review Course' : progress > 0 ? 'Continue Learning' : 'Start Course'}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
