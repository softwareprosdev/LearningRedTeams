import { Test, TestingModule } from '@nestjs/testing';
import { LabsService } from './labs.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { PointEventType } from '../gamification/dto/award-points.dto';

describe('LabsService', () => {
  let service: LabsService;
  let prisma: any;
  let gamification: any;

  beforeEach(async () => {
    prisma = {
      lab: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
      labSession: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      progress: { upsert: jest.fn() },
    };

    gamification = { awardPointsForEvent: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabsService,
        { provide: PrismaService, useValue: prisma },
        { provide: GamificationService, useValue: gamification },
      ],
    }).compile();

    service = module.get<LabsService>(LabsService);
  });

  it('startLabSession returns existing session if found', async () => {
    const existing = { id: 's1', labId: 'lab-1', userId: 'u1', status: 'RUNNING' };
    prisma.lab.findUnique.mockResolvedValue({ id: 'lab-1' });
    prisma.labSession.findFirst.mockResolvedValue(existing);

    const res = await service.startLabSession('lab-1', 'u1');
    expect(res).toEqual(existing);
  });

  it('startLabSession creates and returns a new session', async () => {
    prisma.lab.findUnique.mockResolvedValue({ id: 'lab-2' });
    prisma.labSession.findFirst.mockResolvedValue(null);
    prisma.labSession.create.mockResolvedValue({ id: 'new-session', lab: { id: 'lab-2' } });
    prisma.labSession.update.mockResolvedValue({ id: 'new-session' });
    prisma.labSession.findUnique.mockResolvedValue({ id: 'new-session', lab: { id: 'lab-2' } });

    const res = await service.startLabSession('lab-2', 'u2');
    expect(prisma.labSession.create).toHaveBeenCalled();
    expect(prisma.labSession.update).toHaveBeenCalled();
    expect(prisma.labSession.findUnique).toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining({ id: 'new-session' }));
  });

  it('completeLab throws when no active session', async () => {
    prisma.labSession.findFirst.mockResolvedValue(null);
    await expect(service.completeLab('lab-1', 'u1', ['o1'])).rejects.toThrow(
      'No active lab session found',
    );
  });

  it('completeLab updates session, awards progress and gamification when all objectives done', async () => {
    const lab = {
      id: 'lab-3',
      lessonId: 'lesson-1',
      objectives: [
        { id: 'o1', points: 1 },
        { id: 'o2', points: 2 },
      ],
    };
    const session = { id: 's3', lab, status: 'RUNNING' };

    prisma.labSession.findFirst.mockResolvedValue(session);
    prisma.labSession.update.mockResolvedValue({
      id: 's3',
      status: 'STOPPED',
      completedObjectives: ['o1', 'o2'],
      score: 3,
      lab,
    });
    prisma.progress.upsert.mockResolvedValue({});

    const res = await service.completeLab('lab-3', 'u3', ['o1', 'o2']);

    expect(prisma.labSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 's3' } }),
    );
    expect(prisma.progress.upsert).toHaveBeenCalled();
    expect(gamification.awardPointsForEvent).toHaveBeenCalledWith(
      'u3',
      PointEventType.LAB_COMPLETE,
      session.lab.lessonId,
    );
    expect(res).toEqual(expect.objectContaining({ id: 's3' }));
  });
});
