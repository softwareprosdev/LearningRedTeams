import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto';
import { GamificationService } from '../gamification/gamification.service';
import { PointEventType } from '../gamification/dto/award-points.dto';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async startLesson(userId: string, lessonId: string) {
    // Verify lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if user is enrolled in the course
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    // Create or update progress
    const progress = await this.prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        completed: false,
        watchTime: 0,
      },
      update: {
        updatedAt: new Date(),
      },
    });

    // Update enrollment last accessed
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        lastAccessedAt: new Date(),
      },
    });

    return progress;
  }

  async updateProgress(userId: string, lessonId: string, data: UpdateProgressDto) {
    // Verify lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if user is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    // Update progress
    const progress = await this.prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        completed: false,
        watchTime: data.watchTime || 0,
      },
      update: {
        watchTime: data.watchTime,
      },
    });

    // Update enrollment last accessed
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        lastAccessedAt: new Date(),
      },
    });

    return progress;
  }

  async completeLesson(userId: string, lessonId: string) {
    // Verify lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if user is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course');
    }

    // Mark lesson as complete
    const progress = await this.prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Award points for lesson completion
    try {
      await this.gamificationService.awardPointsForEvent(
        userId,
        PointEventType.LESSON_COMPLETE,
        lessonId,
      );
    } catch (err) {
      // Ignore gamification failures so progress still completes
      console.warn('Gamification award failed for lesson complete:', err?.message || err);
    }

    // Recalculate course progress
    const progressPercentage = await this.updateCourseProgress(userId, lesson.module.courseId);

    // If course is now complete, award course completion points
    if (progressPercentage === 100) {
      try {
        await this.gamificationService.awardPointsForEvent(
          userId,
          PointEventType.COURSE_COMPLETE,
          lesson.module.courseId,
        );
      } catch (err) {
        console.warn('Gamification award failed for course complete:', err?.message || err);
      }
    }

    return progress;
  }

  async getCourseProgress(userId: string, courseId: string) {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Get all lessons for the course
    const allLessons = course.modules.flatMap((module) => module.lessons);
    const totalLessons = allLessons.length;

    if (totalLessons === 0) {
      return {
        courseId,
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        lessons: [],
      };
    }

    // Get user's progress for all lessons
    const userProgress = await this.prisma.progress.findMany({
      where: {
        userId,
        lessonId: {
          in: allLessons.map((l) => l.id),
        },
      },
    });

    const completedLessons = userProgress.filter((p) => p.completed).length;
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    // Get enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return {
      courseId,
      totalLessons,
      completedLessons,
      progressPercentage,
      enrollment,
      lessons: userProgress,
    };
  }

  private async updateCourseProgress(userId: string, courseId: string) {
    // Get all lessons for the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return;
    }

    const allLessons = course.modules.flatMap((module) => module.lessons);
    const totalLessons = allLessons.length;

    if (totalLessons === 0) {
      return;
    }

    // Get user's completed lessons
    const completedProgress = await this.prisma.progress.count({
      where: {
        userId,
        lessonId: {
          in: allLessons.map((l) => l.id),
        },
        completed: true,
      },
    });

    const progressPercentage = Math.round((completedProgress / totalLessons) * 100);

    // Update enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (enrollment) {
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progress: progressPercentage,
          completedAt: progressPercentage === 100 ? new Date() : null,
          lastAccessedAt: new Date(),
        },
      });
    }

    return progressPercentage;
  }
}
