import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { GamificationService } from '../gamification/gamification.service';
import { PointEventType } from '../gamification/dto/award-points.dto';

describe('LessonsService - submitQuiz', () => {
  let service: LessonsService;
  let prisma: Partial<Record<string, jest.Mock>> & any;
  let progressService: any;
  let gamificationService: any;

  beforeEach(async () => {
    // Create lightweight mocks for Prisma and dependent services
    prisma = {
      lesson: {
        findUnique: jest.fn(),
      },
      enrollment: {
        findUnique: jest.fn(),
      },
    };

    progressService = {
      completeLesson: jest.fn().mockResolvedValue(undefined),
    };

    gamificationService = {
      awardPointsForEvent: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ProgressService, useValue: progressService },
        { provide: GamificationService, useValue: gamificationService },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  it('marks lesson complete and awards points for a perfect score', async () => {
    const fakeLesson = {
      id: 'lesson-1',
      module: { courseId: 'course-1' },
      quiz: {
        id: 'quiz-1',
        passingScore: 50,
        questions: [
          { id: 'q1', points: 1, correctAnswer: 'a' },
          { id: 'q2', points: 1, correctAnswer: 'b' },
        ],
      },
    };

    prisma.lesson.findUnique.mockResolvedValue(fakeLesson);
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'enroll-1' });

    const result = await service.submitQuiz('user-1', 'lesson-1', { q1: 'a', q2: 'b' });

    expect(result).toEqual(expect.objectContaining({ score: 100, passed: true }));
    expect(progressService.completeLesson).toHaveBeenCalledWith('user-1', 'lesson-1');
    expect(gamificationService.awardPointsForEvent).toHaveBeenCalledWith(
      'user-1',
      PointEventType.QUIZ_PERFECT,
      'lesson-1',
    );
  });

  it('marks lesson complete when passed (non-perfect) and does not award perfect bonus', async () => {
    const fakeLesson = {
      id: 'lesson-2',
      module: { courseId: 'course-1' },
      quiz: {
        id: 'quiz-2',
        passingScore: 50,
        questions: [
          { id: 'q1', points: 2, correctAnswer: 'x' },
          { id: 'q2', points: 2, correctAnswer: 'y' },
        ],
      },
    };

    prisma.lesson.findUnique.mockResolvedValue(fakeLesson);
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'enroll-2' });

    // answer one of two correctly => 50% -> pass
    const result = await service.submitQuiz('user-2', 'lesson-2', { q1: 'x', q2: 'wrong' });

    expect(result).toEqual(expect.objectContaining({ score: 50, passed: true }));
    expect(progressService.completeLesson).toHaveBeenCalledWith('user-2', 'lesson-2');
    expect(gamificationService.awardPointsForEvent).not.toHaveBeenCalled();
  });

  it('does not mark lesson complete when failing', async () => {
    const fakeLesson = {
      id: 'lesson-3',
      module: { courseId: 'course-1' },
      quiz: {
        id: 'quiz-3',
        passingScore: 70,
        questions: [
          { id: 'q1', points: 2, correctAnswer: 'yes' },
          { id: 'q2', points: 3, correctAnswer: 'no' },
        ],
      },
    };

    prisma.lesson.findUnique.mockResolvedValue(fakeLesson);
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'enroll-3' });

    // answer none correctly
    const result = await service.submitQuiz('user-3', 'lesson-3', { q1: 'wrong', q2: 'wrong' });

    expect(result).toEqual(expect.objectContaining({ score: 0, passed: false }));
    expect(progressService.completeLesson).not.toHaveBeenCalled();
    expect(gamificationService.awardPointsForEvent).not.toHaveBeenCalled();
  });
});
