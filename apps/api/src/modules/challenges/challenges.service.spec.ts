import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesService } from './challenges.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';

describe('ChallengesService - submitFlag', () => {
  let service: ChallengesService;
  let prisma: any;
  let gamification: any;

  beforeEach(async () => {
    prisma = {
      challenge: { findUnique: jest.fn() },
      submission: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn() },
      progress: { upsert: jest.fn() },
    };

    gamification = { awardPoints: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengesService,
        { provide: PrismaService, useValue: prisma },
        { provide: GamificationService, useValue: gamification },
      ],
    }).compile();

    service = module.get<ChallengesService>(ChallengesService);
  });

  it('returns success when flag matches static flag and awards gamification + progress when linked to lesson', async () => {
    const challenge = { id: 'c1', flag: 'FLAG{abc}', isPublished: true, points: 100, lessonId: 'lesson-1' };
    prisma.challenge.findUnique.mockResolvedValue(challenge);
    prisma.submission.findFirst.mockResolvedValue(null);
    prisma.submission.create.mockResolvedValue({ id: 's1', isCorrect: true });

    const res = await service.submitFlag('c1', 'user-1', { flag: 'FLAG{abc}' });

    expect(res).toEqual(expect.objectContaining({ isCorrect: true, points: 100 }));
    expect(prisma.submission.create).toHaveBeenCalled();
    expect(prisma.progress.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_lessonId: { userId: 'user-1', lessonId: 'lesson-1' } },
    }));
    expect(gamification.awardPoints).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', points: 100 }));
  });

  it('returns incorrect when flag does not match', async () => {
    prisma.challenge.findUnique.mockResolvedValue({ id: 'c2', flag: 'FLAG{yes}', isPublished: true, points: 50 });
    prisma.submission.findFirst.mockResolvedValue(null);
    prisma.submission.create.mockResolvedValue({ id: 's2', isCorrect: false });

    const res = await service.submitFlag('c2', 'user-2', { flag: 'WRONG' });

    expect(res).toEqual(expect.objectContaining({ isCorrect: false, points: 0 }));
    expect(prisma.progress.upsert).not.toHaveBeenCalled();
    expect(gamification.awardPoints).not.toHaveBeenCalled();
  });

  it('throws ConflictException when user already solved challenge', async () => {
    prisma.challenge.findUnique.mockResolvedValue({ id: 'c3', flag: 'F', isPublished: true });
    prisma.submission.findFirst.mockResolvedValue({ id: 's-exist', isCorrect: true });

    await expect(service.submitFlag('c3', 'user-3', { flag: 'F' })).rejects.toThrow('You have already solved this challenge');
  });

  it('throws NotFoundException when challenge not found', async () => {
    prisma.challenge.findUnique.mockResolvedValue(null);
    await expect(service.submitFlag('missing', 'user-4', { flag: 'x' })).rejects.toThrow('Challenge not found');
  });

  it('throws BadRequestException when challenge unpublished', async () => {
    prisma.challenge.findUnique.mockResolvedValue({ id: 'c5', isPublished: false });
    await expect(service.submitFlag('c5', 'user-5', { flag: 'x' })).rejects.toThrow('This challenge is not published');
  });
});
