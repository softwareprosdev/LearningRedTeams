import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { PointEventType } from '../gamification/dto/award-points.dto';
import { CreateChallengeDto, UpdateChallengeDto, SubmitFlagDto } from './dto';
import * as crypto from 'crypto';

@Injectable()
export class ChallengesService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  async findAll(includeUnpublished = false): Promise<any[]> {
    return this.prisma.challenge.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        isPublished: true,
        mitreMappings: {
          include: {
            technique: {
              include: {
                tactic: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: {
              where: {
                isCorrect: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<any> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        mitreMappings: {
          include: {
            technique: {
              include: {
                tactic: true,
              },
            },
          },
        },
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: {
              where: {
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Don't expose the flag in the response
    const { flag, ...challengeWithoutFlag } = challenge;

    return challengeWithoutFlag;
  }

  async submitFlag(challengeId: string, userId: string, submitFlagDto: SubmitFlagDto): Promise<any> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (!challenge.isPublished) {
      throw new BadRequestException('This challenge is not published');
    }

    // Check if user already solved this challenge
    const existingSolve = await this.prisma.submission.findFirst({
      where: {
        challengeId,
        userId,
        isCorrect: true,
      },
    });

    if (existingSolve) {
      throw new ConflictException('You have already solved this challenge');
    }

    // Validate flag
    const isCorrect = this.validateFlag(challenge, submitFlagDto.flag, userId);
    const points = isCorrect ? challenge.points : 0;

    // Create submission
    const submission = await this.prisma.submission.create({
      data: {
        userId,
        challengeId,
        flag: submitFlagDto.flag,
        isCorrect,
        points,
      },
    });

    // If correct and linked to a lesson, mark progress as complete
    if (isCorrect && challenge.lessonId) {
      await this.prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: challenge.lessonId,
          },
        },
        create: {
          userId,
          lessonId: challenge.lessonId,
          completed: true,
          completedAt: new Date(),
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    // Award gamification points for solving a challenge
    if (isCorrect) {
      try {
        // award points based on challenge.points, include challenge id in metadata
        await this.gamificationService.awardPoints({
          userId,
          points: challenge.points || 0,
          eventType: PointEventType.CHALLENGE_COMPLETE,
          metadata: JSON.stringify({ challengeId }),
        });
      } catch (err) {
        console.warn('Failed to award gamification points for challenge:', err?.message || err);
      }
    }

    return {
      isCorrect,
      points,
      message: isCorrect ? 'Congratulations! Flag accepted.' : 'Incorrect flag. Try again.',
    };
  }

  async getUserSubmissions(challengeId: string, userId: string): Promise<any[]> {
    return this.prisma.submission.findMany({
      where: {
        challengeId,
        userId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async create(data: CreateChallengeDto): Promise<any> {
    // If lessonId is provided, check if lesson exists
    if (data.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: data.lessonId },
      });

      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }

      // Check if lesson already has a challenge
      const existingChallenge = await this.prisma.challenge.findUnique({
        where: { lessonId: data.lessonId },
      });

      if (existingChallenge) {
        throw new BadRequestException('This lesson already has a challenge');
      }
    }

    // Create challenge
    const challenge = await this.prisma.challenge.create({
      data: {
        lessonId: data.lessonId,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        flag: data.flag,
        flagFormat: data.flagFormat,
        points: data.points,
        files: data.files || [],
        hints: data.hints || [],
        isPublished: data.isPublished || false,
      },
    });

    // Create MITRE mappings if provided
    if (data.mitreTechniqueIds && data.mitreTechniqueIds.length > 0) {
      await Promise.all(
        data.mitreTechniqueIds.map((techniqueId) =>
          this.prisma.challengeMitreMapping.create({
            data: {
              challengeId: challenge.id,
              techniqueId,
            },
          }),
        ),
      );
    }

    return this.findById(challenge.id);
  }

  async update(id: string, data: UpdateChallengeDto): Promise<any> {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Update challenge
    await this.prisma.challenge.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.flag !== undefined && { flag: data.flag }),
        ...(data.flagFormat !== undefined && { flagFormat: data.flagFormat }),
        ...(data.points && { points: data.points }),
        ...(data.files !== undefined && { files: data.files }),
        ...(data.hints !== undefined && { hints: data.hints }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });

    // Update MITRE mappings if provided
    if (data.mitreTechniqueIds) {
      // Delete existing mappings
      await this.prisma.challengeMitreMapping.deleteMany({
        where: { challengeId: id },
      });

      // Create new mappings
      if (data.mitreTechniqueIds.length > 0) {
        await Promise.all(
          data.mitreTechniqueIds.map((techniqueId) =>
            this.prisma.challengeMitreMapping.create({
              data: {
                challengeId: id,
                techniqueId,
              },
            }),
          ),
        );
      }
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    await this.prisma.challenge.delete({ where: { id } });
  }

  async getAllSubmissions(challengeId: string): Promise<any[]> {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return this.prisma.submission.findMany({
      where: {
        challengeId,
      },
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
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private validateFlag(challenge: any, submittedFlag: string, userId: string): boolean {
    // Static flag validation
    if (challenge.flag) {
      return submittedFlag.trim() === challenge.flag.trim();
    }

    // Dynamic flag validation
    if (challenge.flagFormat) {
      // Generate dynamic flag for this user
      const dynamicFlag = this.generateDynamicFlag(challenge.flagFormat, userId, challenge.id);
      return submittedFlag.trim() === dynamicFlag.trim();
    }

    return false;
  }

  private generateDynamicFlag(format: string, userId: string, challengeId: string): string {
    // Generate a deterministic hash based on userId and challengeId
    const hash = crypto
      .createHash('sha256')
      .update(`${userId}-${challengeId}`)
      .digest('hex')
      .substring(0, 16);

    // Replace {hash} placeholder in format
    return format.replace('{hash}', hash);
  }
}
