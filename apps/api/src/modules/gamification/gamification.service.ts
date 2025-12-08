import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwardPointsDto, PointEventType } from './dto';

// Point values for different events
const POINTS = {
  LESSON_COMPLETE: 10,
  COURSE_COMPLETE: 100,
  QUIZ_PERFECT: 25,
  LAB_COMPLETE: 50,
  CHALLENGE_COMPLETE: 75,
};

// Points needed for each level
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  2000,  // Level 6
  3500,  // Level 7
  5500,  // Level 8
  8000,  // Level 9
  11000, // Level 10
];

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // USER STATS
  // ============================================================================

  async getOrCreateUserStats(userId: string) {
    let stats = await this.prisma.userStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await this.prisma.userStats.create({
        data: {
          userId,
          totalPoints: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date(),
        },
      });
    }

    return stats;
  }

  async getUserStats(userId: string) {
    const stats = await this.getOrCreateUserStats(userId);

    // Get user achievements
    const achievements = await this.prisma.userAchievement.findMany({
      where: { userId, earnedAt: { not: null } },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    });

    // Calculate next level info
    const currentLevel = stats.level;
    const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
    const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const progressToNextLevel = stats.totalPoints - currentLevelThreshold;
    const pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;

    return {
      ...stats,
      achievements: achievements.map(ua => ({
        ...ua.achievement,
        earnedAt: ua.earnedAt,
      })),
      nextLevelThreshold,
      progressToNextLevel,
      pointsNeededForNextLevel,
    };
  }

  async getLeaderboard(limit: number = 100) {
    const topUsers = await this.prisma.userStats.findMany({
      take: limit,
      orderBy: [
        { totalPoints: 'desc' },
        { level: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return topUsers.map((stats, index) => ({
      rank: index + 1,
      userId: stats.userId,
      firstName: stats.user.firstName,
      lastName: stats.user.lastName,
      avatar: stats.user.avatar,
      totalPoints: stats.totalPoints,
      level: stats.level,
      currentStreak: stats.currentStreak,
      coursesCompleted: stats.coursesCompleted,
    }));
  }

  // ============================================================================
  // POINTS & LEVELING
  // ============================================================================

  async awardPoints(dto: AwardPointsDto) {
    const { userId, points, eventType, metadata } = dto;

    // Get or create user stats
    const stats = await this.getOrCreateUserStats(userId);

    // Update points
    const newTotalPoints = stats.totalPoints + points;

    // Calculate new level
    let newLevel = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newTotalPoints >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    const leveledUp = newLevel > stats.level;

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = new Date(stats.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = stats.currentStreak;
    if (daysDiff === 0) {
      // Same day, keep streak
      newStreak = stats.currentStreak;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak = stats.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    const longestStreak = Math.max(stats.longestStreak, newStreak);

    // Update completion counts based on event type
    const updates: any = {
      totalPoints: newTotalPoints,
      level: newLevel,
      currentStreak: newStreak,
      longestStreak: longestStreak,
      lastActivityDate: new Date(),
    };

    switch (eventType) {
      case PointEventType.LESSON_COMPLETE:
        updates.lessonsCompleted = stats.lessonsCompleted + 1;
        break;
      case PointEventType.COURSE_COMPLETE:
        updates.coursesCompleted = stats.coursesCompleted + 1;
        break;
      case PointEventType.QUIZ_PERFECT:
        updates.quizzesCompleted = stats.quizzesCompleted + 1;
        updates.perfectScores = stats.perfectScores + 1;
        break;
      case PointEventType.LAB_COMPLETE:
        updates.labsCompleted = stats.labsCompleted + 1;
        break;
      case PointEventType.CHALLENGE_COMPLETE:
        updates.challengesCompleted = stats.challengesCompleted + 1;
        break;
    }

    // Update stats
    const updatedStats = await this.prisma.userStats.update({
      where: { userId },
      data: updates,
    });

    // Check and award achievements
    const newAchievements = await this.checkAndAwardAchievements(userId, eventType, updatedStats);

    return {
      pointsAwarded: points,
      newTotalPoints: updatedStats.totalPoints,
      level: updatedStats.level,
      leveledUp,
      newAchievements,
    };
  }

  async awardPointsForEvent(userId: string, eventType: PointEventType, metadata?: string) {
    const points = POINTS[eventType] || 0;

    if (points === 0) {
      throw new BadRequestException('Invalid event type');
    }

    return this.awardPoints({
      userId,
      points,
      eventType,
      metadata,
    });
  }

  private calculateLevel(totalPoints: number): number {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return level;
  }

  // ============================================================================
  // ACHIEVEMENTS
  // ============================================================================

  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { points: 'asc' }],
    });
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  private async checkAndAwardAchievements(userId: string, eventType: PointEventType, stats: any) {
    const newAchievements: any[] = [];

    // Get all active achievements
    const achievements = await this.prisma.achievement.findMany({
      where: { isActive: true },
    });

    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existingUserAchievement = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      // Skip if already earned
      if (existingUserAchievement?.earnedAt) {
        continue;
      }

      // Check if achievement criteria is met
      const shouldAward = this.checkAchievementCriteria(achievement, eventType, stats);

      if (shouldAward) {
        // Award the achievement
        const userAchievement = await this.prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
          create: {
            userId,
            achievementId: achievement.id,
            earnedAt: new Date(),
            progress: 100,
          },
          update: {
            earnedAt: new Date(),
            progress: 100,
          },
          include: {
            achievement: true,
          },
        });

        newAchievements.push(userAchievement.achievement);
      }
    }

    return newAchievements;
  }

  private checkAchievementCriteria(achievement: any, eventType: PointEventType, stats: any): boolean {
    const criteria = achievement.criteria as any;

    switch (achievement.type) {
      case 'COURSE_COMPLETE':
        if (criteria?.count) {
          return stats.coursesCompleted >= criteria.count;
        }
        return eventType === PointEventType.COURSE_COMPLETE;

      case 'LESSON_COMPLETE':
        if (criteria?.count) {
          return stats.lessonsCompleted >= criteria.count;
        }
        return eventType === PointEventType.LESSON_COMPLETE;

      case 'QUIZ_PERFECT':
        if (criteria?.count) {
          return stats.perfectScores >= criteria.count;
        }
        return eventType === PointEventType.QUIZ_PERFECT;

      case 'LAB_COMPLETE':
        if (criteria?.count) {
          return stats.labsCompleted >= criteria.count;
        }
        return eventType === PointEventType.LAB_COMPLETE;

      case 'CHALLENGE_COMPLETE':
        if (criteria?.count) {
          return stats.challengesCompleted >= criteria.count;
        }
        return eventType === PointEventType.CHALLENGE_COMPLETE;

      case 'POINTS_MILESTONE':
        if (criteria?.points) {
          return stats.totalPoints >= criteria.points;
        }
        return false;

      case 'STREAK':
        if (criteria?.days) {
          return stats.currentStreak >= criteria.days;
        }
        return false;

      case 'FIRST_LOGIN':
        return true; // This should be awarded on first login

      default:
        return false;
    }
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async seedAchievements() {
    const achievementsData = [
      // First steps
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '👶',
        points: 10,
        type: 'LESSON_COMPLETE',
        tier: 'bronze',
        criteria: { count: 1 },
      },
      {
        name: 'Getting Started',
        description: 'Complete 10 lessons',
        icon: '🚀',
        points: 50,
        type: 'LESSON_COMPLETE',
        tier: 'silver',
        criteria: { count: 10 },
      },
      {
        name: 'Dedicated Learner',
        description: 'Complete 50 lessons',
        icon: '📚',
        points: 200,
        type: 'LESSON_COMPLETE',
        tier: 'gold',
        criteria: { count: 50 },
      },

      // Course completion
      {
        name: 'Course Completed',
        description: 'Complete your first course',
        icon: '🎓',
        points: 100,
        type: 'COURSE_COMPLETE',
        tier: 'bronze',
        criteria: { count: 1 },
      },
      {
        name: 'Course Master',
        description: 'Complete 5 courses',
        icon: '🏆',
        points: 500,
        type: 'COURSE_COMPLETE',
        tier: 'gold',
        criteria: { count: 5 },
      },

      // Quiz achievements
      {
        name: 'Perfect Score',
        description: 'Get a perfect score on a quiz',
        icon: '💯',
        points: 25,
        type: 'QUIZ_PERFECT',
        tier: 'bronze',
        criteria: { count: 1 },
      },
      {
        name: 'Quiz Expert',
        description: 'Get perfect scores on 10 quizzes',
        icon: '🧠',
        points: 250,
        type: 'QUIZ_PERFECT',
        tier: 'gold',
        criteria: { count: 10 },
      },

      // Lab achievements
      {
        name: 'Hands-On Learner',
        description: 'Complete your first lab',
        icon: '🔬',
        points: 50,
        type: 'LAB_COMPLETE',
        tier: 'bronze',
        criteria: { count: 1 },
      },
      {
        name: 'Lab Veteran',
        description: 'Complete 10 labs',
        icon: '⚗️',
        points: 300,
        type: 'LAB_COMPLETE',
        tier: 'gold',
        criteria: { count: 10 },
      },

      // Challenge achievements
      {
        name: 'Challenge Accepted',
        description: 'Complete your first challenge',
        icon: '⚔️',
        points: 75,
        type: 'CHALLENGE_COMPLETE',
        tier: 'silver',
        criteria: { count: 1 },
      },
      {
        name: 'Challenge Master',
        description: 'Complete 10 challenges',
        icon: '🛡️',
        points: 500,
        type: 'CHALLENGE_COMPLETE',
        tier: 'platinum',
        criteria: { count: 10 },
      },

      // Points milestones
      {
        name: 'Point Collector',
        description: 'Earn 500 points',
        icon: '⭐',
        points: 0,
        type: 'POINTS_MILESTONE',
        tier: 'bronze',
        criteria: { points: 500 },
      },
      {
        name: 'Point Master',
        description: 'Earn 2000 points',
        icon: '🌟',
        points: 0,
        type: 'POINTS_MILESTONE',
        tier: 'gold',
        criteria: { points: 2000 },
      },
      {
        name: 'Point Legend',
        description: 'Earn 5000 points',
        icon: '💎',
        points: 0,
        type: 'POINTS_MILESTONE',
        tier: 'platinum',
        criteria: { points: 5000 },
      },

      // Streak achievements
      {
        name: 'On a Roll',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        points: 100,
        type: 'STREAK',
        tier: 'silver',
        criteria: { days: 7 },
      },
      {
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        points: 500,
        type: 'STREAK',
        tier: 'platinum',
        criteria: { days: 30 },
      },
    ];

    const created = [];
    for (const data of achievementsData) {
      const achievement = await this.prisma.achievement.upsert({
        where: { name: data.name },
        create: data,
        update: data,
      });
      created.push(achievement);
    }

    return created;
  }
}
