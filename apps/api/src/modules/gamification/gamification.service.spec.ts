import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { PointEventType } from './dto/award-points.dto';

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      userStats: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      achievement: { findMany: jest.fn() },
      userAchievement: { findUnique: jest.fn(), upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  it('awards points for a lesson complete and may award an achievement', async () => {
    // initial stats - user has zero points, lastActivity yesterday so streak increments
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    prisma.userStats.findUnique.mockResolvedValue({
      userId: 'u1',
      totalPoints: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: yesterday,
      lessonsCompleted: 0,
      quizzesCompleted: 0,
      perfectScores: 0,
      labsCompleted: 0,
      challengesCompleted: 0,
      coursesCompleted: 0,
    });

    prisma.achievement.findMany.mockResolvedValue([
      { id: 'a1', type: 'LESSON_COMPLETE', criteria: { count: 1 }, isActive: true },
    ]);

    prisma.userAchievement.findUnique.mockResolvedValue(null);
    prisma.userAchievement.upsert.mockResolvedValue({ achievement: { id: 'a1', name: 'First Steps' } });

    prisma.userStats.update.mockResolvedValue({ totalPoints: 10, level: 1, currentStreak: 1, lessonsCompleted: 1 });

    const res = await service.awardPointsForEvent('u1', PointEventType.LESSON_COMPLETE);

    expect(res.pointsAwarded).toBeGreaterThan(0);
    expect(res.newTotalPoints).toBeDefined();
    // newAchievements is array of achievement objects (we mock upsert to return achievement)
    expect(Array.isArray(res.newAchievements)).toBe(true);
    expect(prisma.userStats.update).toHaveBeenCalled();
    expect(prisma.userAchievement.upsert).toHaveBeenCalled();
  });

  it('handles level up when crossing threshold', async () => {
    // set stats so next award causes level up
    prisma.userStats.findUnique.mockResolvedValue({
      userId: 'u2',
      totalPoints: 95,
      level: 1,
      currentStreak: 2,
      longestStreak: 2,
      lastActivityDate: new Date(),
      lessonsCompleted: 0,
      quizzesCompleted: 0,
      perfectScores: 0,
      labsCompleted: 0,
      challengesCompleted: 0,
      coursesCompleted: 0,
    });

    prisma.achievement.findMany.mockResolvedValue([]);
    prisma.userStats.update.mockImplementation(async ({ data }) => ({ ...data }));

    const result = await service.awardPointsForEvent('u2', PointEventType.QUIZ_PERFECT);

    expect(result.pointsAwarded).toBeGreaterThan(0);
    expect(result.leveledUp).toBe(true);
  });

  it('throws when calling awardPointsForEvent with a custom/zero-points event', async () => {
    await expect(service.awardPointsForEvent('x', PointEventType.CUSTOM)).rejects.toThrow();
  });
});
