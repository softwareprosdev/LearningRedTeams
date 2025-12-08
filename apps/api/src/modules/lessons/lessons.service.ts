import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { GamificationService } from '../gamification/gamification.service';
import { PointEventType } from '../gamification/dto/award-points.dto';
import { CreateLessonDto, UpdateLessonDto } from './dto';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
    private gamificationService: GamificationService,
  ) {}

  async findByModuleId(moduleId: string): Promise<any[]> {
    return this.prisma.lesson.findMany({
      where: { moduleId },
      include: {
        video: true,
        quiz: true,
        lab: true,
        challenge: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<any> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        video: true,
        quiz: {
          include: {
            questions: true,
          },
        },
        lab: true,
        challenge: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async create(data: CreateLessonDto): Promise<any> {
    // Verify module exists
    const module = await this.prisma.module.findUnique({
      where: { id: data.moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check if order already exists for this module
    const existing = await this.prisma.lesson.findFirst({
      where: {
        moduleId: data.moduleId,
        order: data.order,
      },
    });

    if (existing) {
      throw new ConflictException(
        'A lesson with this order already exists in this module',
      );
    }

    return this.prisma.lesson.create({
      data: {
        title: data.title,
        type: data.type,
        order: data.order,
        moduleId: data.moduleId,
        videoId: data.videoId,
        textContent: data.textContent,
        quizId: data.quizId,
        labId: data.labId,
        challengeId: data.challengeId,
        resources: data.resources,
        isFreePreview: data.isFreePreview || false,
      },
      include: {
        video: true,
        quiz: true,
        lab: true,
        challenge: true,
      },
    });
  }

  async update(id: string, data: UpdateLessonDto): Promise<any> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check order uniqueness if order or moduleId is being updated
    if (
      (data.order !== undefined && data.order !== lesson.order) ||
      (data.moduleId && data.moduleId !== lesson.moduleId)
    ) {
      const moduleId = data.moduleId || lesson.moduleId;
      const order = data.order !== undefined ? data.order : lesson.order;

      const existing = await this.prisma.lesson.findFirst({
        where: {
          moduleId,
          order,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'A lesson with this order already exists in this module',
        );
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.moduleId && { moduleId: data.moduleId }),
        ...(data.videoId !== undefined && { videoId: data.videoId }),
        ...(data.textContent !== undefined && { textContent: data.textContent }),
        ...(data.quizId !== undefined && { quizId: data.quizId }),
        ...(data.labId !== undefined && { labId: data.labId }),
        ...(data.challengeId !== undefined && { challengeId: data.challengeId }),
        ...(data.resources !== undefined && { resources: data.resources }),
        ...(data.isFreePreview !== undefined && { isFreePreview: data.isFreePreview }),
      },
      include: {
        video: true,
        quiz: true,
        lab: true,
        challenge: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.prisma.lesson.delete({ where: { id } });
  }

  // Submit quiz answers for a lesson and evaluate score. If passing, mark lesson completed and
  // optionally award additional points if a perfect score.
  async submitQuiz(userId: string, lessonId: string, answers: Record<string, any>) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: { include: { questions: true } },
        module: { include: { course: true } },
      },
    });

    if (!lesson || !lesson.quiz) {
      throw new Error('Quiz not found for this lesson');
    }

    // Ensure user is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: lesson.module.courseId },
      },
    });

    if (!enrollment) {
      throw new Error('You are not enrolled in this course');
    }

    // Score calculation
    const questions = lesson.quiz.questions;
    let maxPoints = 0;
    let earnedPoints = 0;

    const normalize = (val: any) => {
      if (val === null || val === undefined) return null;
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    };

    for (const q of questions) {
      maxPoints += q.points || 1;
      const userAnswer = answers[q.id];
      const correct = normalize(userAnswer) === normalize(q.correctAnswer);
      if (correct) {
        earnedPoints += q.points || 1;
      }
    }

    const percentage = Math.round((earnedPoints / (maxPoints || 1)) * 100);
    const passed = percentage >= (lesson.quiz.passingScore || 70);

    // Persisting attempts is out of scope for now — just return results and update progress

    // If passed, mark lesson complete using ProgressService so progress and gamification are handled.
    if (passed) {
      await this.progressService.completeLesson(userId, lessonId);
    }

    // If perfect, award quiz-perfect event (extra bonus points)
    if (percentage === 100) {
      try {
        await this.gamificationService.awardPointsForEvent(userId, PointEventType.QUIZ_PERFECT, lessonId);
      } catch (err) {
        console.warn('Failed to award quiz perfect gamification:', err?.message || err);
      }
    }

    return { score: percentage, passed, earnedPoints, maxPoints };
  }

  async reorder(
    moduleId: string,
    lessonOrders: { id: string; order: number }[],
  ): Promise<any[]> {
    // Verify module exists
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Update all lessons in a transaction
    await this.prisma.$transaction(
      lessonOrders.map(({ id, order }) =>
        this.prisma.lesson.update({
          where: { id },
          data: { order },
        }),
      ),
    );

    return this.findByModuleId(moduleId);
  }
}
