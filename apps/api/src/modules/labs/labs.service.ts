import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { PointEventType } from '../gamification/dto/award-points.dto';
import { CreateLabDto, UpdateLabDto } from './dto';

@Injectable()
export class LabsService {
  constructor(private prisma: PrismaService, private gamificationService: GamificationService) {}

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  async findById(id: string): Promise<any> {
    const lab = await this.prisma.lab.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!lab) {
      throw new NotFoundException('Lab not found');
    }

    return lab;
  }

  async startLabSession(labId: string, userId: string): Promise<any> {
    const lab = await this.prisma.lab.findUnique({
      where: { id: labId },
    });

    if (!lab) {
      throw new NotFoundException('Lab not found');
    }

    // Check if user already has an active session for this lab
    const existingSession = await this.prisma.labSession.findFirst({
      where: {
        labId,
        userId,
        status: {
          in: ['STARTING', 'RUNNING'],
        },
      },
    });

    if (existingSession) {
      return existingSession;
    }

    // Create new lab session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 4); // 4 hour session

    const session = await this.prisma.labSession.create({
      data: {
        userId,
        labId,
        status: 'STARTING',
        containerIds: [],
        completedObjectives: [],
        score: 0,
        expiresAt,
      },
      include: {
        lab: true,
      },
    });

    // TODO: Integrate with Docker orchestration service to spin up containers
    // For now, we'll just mark it as RUNNING
    await this.prisma.labSession.update({
      where: { id: session.id },
      data: {
        status: 'RUNNING',
        containerIds: ['placeholder-container-id'],
        accessUrl: 'http://localhost:6080/vnc.html', // noVNC placeholder
      },
    });

    return this.prisma.labSession.findUnique({
      where: { id: session.id },
      include: {
        lab: true,
      },
    });
  }

  async completeLab(labId: string, userId: string, completedObjectives: string[]): Promise<any> {
    const session = await this.prisma.labSession.findFirst({
      where: {
        labId,
        userId,
        status: 'RUNNING',
      },
      include: {
        lab: true,
      },
    });

    if (!session) {
      throw new NotFoundException('No active lab session found');
    }

    // Calculate score based on completed objectives
    const objectives = session.lab.objectives as any[];
    let totalScore = 0;

    completedObjectives.forEach((objId) => {
      const objective = objectives.find((o: any) => o.id === objId);
      if (objective) {
        totalScore += objective.points || 0;
      }
    });

    // Update session
    const updatedSession = await this.prisma.labSession.update({
      where: { id: session.id },
      data: {
        status: 'STOPPED',
        completedObjectives: completedObjectives,
        score: totalScore,
        stoppedAt: new Date(),
      },
      include: {
        lab: true,
      },
    });

    // Mark lesson progress as completed if all objectives are done
    if (completedObjectives.length === objectives.length) {
      await this.prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: session.lab.lessonId,
          },
        },
        create: {
          userId,
          lessonId: session.lab.lessonId,
          completed: true,
          completedAt: new Date(),
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
      });
      // Award lab completion gamification points
      try {
        await this.gamificationService.awardPointsForEvent(userId, PointEventType.LAB_COMPLETE, session.lab.lessonId);
      } catch (err) {
        console.warn('Failed to award lab gamification:', err?.message || err);
      }
    }

    return updatedSession;
  }

  async getUserLabSessions(userId: string): Promise<any[]> {
    return this.prisma.labSession.findMany({
      where: {
        userId,
      },
      include: {
        lab: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async findAll(): Promise<any[]> {
    return this.prisma.lab.findMany({
      include: {
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
            sessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: CreateLabDto): Promise<any> {
    // Check if lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: data.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if lesson already has a lab
    const existingLab = await this.prisma.lab.findUnique({
      where: { lessonId: data.lessonId },
    });

    if (existingLab) {
      throw new BadRequestException('This lesson already has a lab');
    }

    return this.prisma.lab.create({
      data: {
        lessonId: data.lessonId,
        name: data.name,
        description: data.description,
        templateId: data.templateId,
        networkTopology: data.networkTopology,
        objectives: data.objectives,
        estimatedTime: data.estimatedTime,
        hints: data.hints || [],
      },
    });
  }

  async update(id: string, data: UpdateLabDto): Promise<any> {
    const lab = await this.prisma.lab.findUnique({ where: { id } });

    if (!lab) {
      throw new NotFoundException('Lab not found');
    }

    return this.prisma.lab.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.templateId && { templateId: data.templateId }),
        ...(data.networkTopology && { networkTopology: data.networkTopology }),
        ...(data.objectives && { objectives: data.objectives }),
        ...(data.estimatedTime && { estimatedTime: data.estimatedTime }),
        ...(data.hints !== undefined && { hints: data.hints }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    const lab = await this.prisma.lab.findUnique({ where: { id } });

    if (!lab) {
      throw new NotFoundException('Lab not found');
    }

    await this.prisma.lab.delete({ where: { id } });
  }
}
