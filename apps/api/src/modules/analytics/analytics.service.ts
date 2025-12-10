import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total students
    const totalStudents = await this.prisma.user.count({
      where: {
        role: 'STUDENT',
      },
    });

    // Get total enrollments
    const totalEnrollments = await this.prisma.enrollment.count();

    // Get total completions
    const totalCompletions = await this.prisma.enrollment.count({
      where: {
        completedAt: {
          not: null,
        },
      },
    });

    // Get active users (users who accessed courses in last 30 days)
    const activeUsers = await this.prisma.enrollment.groupBy({
      by: ['userId'],
      where: {
        lastAccessedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get popular courses (by enrollment count)
    const popularCourses = await this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get recent completions
    const recentCompletions = await this.prisma.enrollment.findMany({
      where: {
        completedAt: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    });

    // Get daily active users for the last 30 days
    const dailyActiveUsers = await this.getDailyActiveUsers(30);

    // Calculate completion rate
    const completionRate =
      totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;

    return {
      totalStudents,
      totalEnrollments,
      totalCompletions,
      completionRate,
      activeUsersCount: activeUsers.length,
      popularCourses: popularCourses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
        enrollmentCount: course._count.enrollments,
      })),
      recentCompletions: recentCompletions.map((completion) => ({
        id: completion.id,
        completedAt: completion.completedAt,
        user: {
          name: `${completion.user.firstName} ${completion.user.lastName}`,
          email: completion.user.email,
        },
        course: {
          title: completion.course.title,
          slug: completion.course.slug,
        },
      })),
      dailyActiveUsers,
    };
  }

  async getCourseAnalytics(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    const totalEnrollments = course.enrollments.length;
    const completedEnrollments = course.enrollments.filter((e) => e.completedAt !== null).length;
    const completionRate =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Calculate average completion time
    const completedWithTime = course.enrollments.filter((e) => e.completedAt && e.enrolledAt);
    const avgCompletionTime =
      completedWithTime.length > 0
        ? Math.round(
            completedWithTime.reduce((sum, e) => {
              const days = Math.floor(
                (e.completedAt!.getTime() - e.enrolledAt.getTime()) / (1000 * 60 * 60 * 24),
              );
              return sum + days;
            }, 0) / completedWithTime.length,
          )
        : 0;

    // Get lesson completion rates
    const allLessons = course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        moduleTitle: module.title,
        order: lesson.order,
        moduleOrder: module.order,
      })),
    );

    const lessonCompletionRates = await Promise.all(
      allLessons.map(async (lesson) => {
        const completedCount = await this.prisma.progress.count({
          where: {
            lessonId: lesson.id,
            completed: true,
          },
        });

        return {
          ...lesson,
          completionRate:
            totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0,
          completedCount,
        };
      }),
    );

    // Get enrollment trend over time (last 90 days)
    const enrollmentTrend = await this.getEnrollmentTrend(courseId, 90);

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
      },
      totalEnrollments,
      completedEnrollments,
      completionRate,
      avgCompletionTime,
      lessonCompletionRates: lessonCompletionRates.sort(
        (a, b) => a.moduleOrder - b.moduleOrder || a.order - b.order,
      ),
      enrollmentTrend,
    };
  }

  async getStudents() {
    const students = await this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            progress: true,
            completedAt: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return students.map((student) => ({
      id: student.id,
      email: student.email,
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      joinedAt: student.createdAt,
      enrollmentCount: student.enrollments.length,
      completedCount: student.enrollments.filter((e) => e.completedAt).length,
      averageProgress:
        student.enrollments.length > 0
          ? Math.round(
              student.enrollments.reduce((sum, e) => sum + e.progress, 0) /
                student.enrollments.length,
            )
          : 0,
    }));
  }

  async getStudentProgress(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
              },
            },
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        },
      },
    });

    if (!student) {
      return null;
    }

    const enrollmentsWithDetails = await Promise.all(
      student.enrollments.map(async (enrollment) => {
        // Get total lessons in course
        const totalLessons = await this.prisma.lesson.count({
          where: {
            module: {
              courseId: enrollment.courseId,
            },
          },
        });

        // Get completed lessons
        const completedLessons = await this.prisma.progress.count({
          where: {
            userId: studentId,
            completed: true,
            lesson: {
              module: {
                courseId: enrollment.courseId,
              },
            },
          },
        });

        return {
          id: enrollment.id,
          course: enrollment.course,
          progress: enrollment.progress,
          completedAt: enrollment.completedAt,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          totalLessons,
          completedLessons,
        };
      }),
    );

    return {
      student: {
        id: student.id,
        email: student.email,
        name: `${student.firstName} ${student.lastName}`,
        firstName: student.firstName,
        lastName: student.lastName,
        joinedAt: student.createdAt,
      },
      enrollments: enrollmentsWithDetails,
      totalEnrollments: student.enrollments.length,
      completedCourses: student.enrollments.filter((e) => e.completedAt).length,
    };
  }

  private async getDailyActiveUsers(days: number) {
    const result: { date: string; count: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const activeUsers = await this.prisma.enrollment.groupBy({
        by: ['userId'],
        where: {
          lastAccessedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      result.push({
        date: date.toISOString().split('T')[0],
        count: activeUsers.length,
      });
    }

    return result;
  }

  private async getEnrollmentTrend(courseId: string, days: number) {
    const result: { date: string; count: number }[] = [];
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId,
        enrolledAt: {
          gte: startDate,
        },
      },
      select: {
        enrolledAt: true,
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    });

    // Group by date
    const enrollmentsByDate = new Map<string, number>();
    enrollments.forEach((enrollment) => {
      const date = enrollment.enrolledAt.toISOString().split('T')[0];
      enrollmentsByDate.set(date, (enrollmentsByDate.get(date) || 0) + 1);
    });

    // Fill in all dates
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: enrollmentsByDate.get(dateStr) || 0,
      });
    }

    return result;
  }
}
