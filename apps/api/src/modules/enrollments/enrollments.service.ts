import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enrollUserInCourse(userId: string, courseId: string): Promise<any> {
    // Verify course exists and is published
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.isPublished) {
      throw new ForbiddenException('Cannot enroll in unpublished course');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    // Create enrollment
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        progress: 0,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnail: true,
            difficulty: true,
            category: true,
          },
        },
      },
    });
  }

  async getUserEnrollments(userId: string): Promise<any[]> {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            thumbnail: true,
            difficulty: true,
            category: true,
            duration: true,
            _count: {
              select: {
                modules: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });
  }

  async getUserEnrollmentForCourse(userId: string, courseId: string): Promise<any> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: true,
      },
    });

    return enrollment;
  }

  async updateLastAccessed(userId: string, courseId: string): Promise<void> {
    await this.prisma.enrollment.updateMany({
      where: {
        userId,
        courseId,
      },
      data: {
        lastAccessedAt: new Date(),
      },
    });
  }

  async updateProgress(userId: string, courseId: string, progress: number): Promise<any> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const updateData: any = {
      progress,
      lastAccessedAt: new Date(),
    };

    // If progress is 100%, mark as completed
    if (progress >= 100 && !enrollment.completedAt) {
      updateData.completedAt = new Date();
    }

    return this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: updateData,
    });
  }
}
