import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('LabsController (integration)', () => {
  let app: INestApplication;

  const mockService = {
    findById: jest.fn().mockResolvedValue({ id: 'lab-1', name: 'A lab' }),
    startLabSession: jest.fn().mockResolvedValue({ id: 'session-1', status: 'RUNNING' }),
    completeLab: jest.fn().mockResolvedValue({ id: 'session-1', status: 'STOPPED' }),
    getUserLabSessions: jest.fn().mockResolvedValue([{ id: 'session-1' }]),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [LabsController],
      providers: [{ provide: LabsService, useValue: mockService }],
    });

    const moduleFixture = await moduleBuilder.compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => await app.close());

  it('GET /labs/:id (public) returns lab info', async () => {
    const res = await request(app.getHttpServer()).get('/labs/lab-1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ id: 'lab-1' }));
    expect(mockService.findById).toHaveBeenCalledWith('lab-1');
  });

  it('guarded endpoints return 403 when unauthenticated', async () => {
    const denyModule = await Test.createTestingModule({
      controllers: [LabsController],
      providers: [{ provide: LabsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => false })
      .compile();

    const denyApp = denyModule.createNestApplication();
    await denyApp.init();

    const res = await request(denyApp.getHttpServer()).post('/labs/lab-1/start');
    expect(res.status).toBe(403);
    await denyApp.close();
  });

  it('guarded endpoints work when guard allows and injects user', async () => {
    const allowModule = await Test.createTestingModule({
      controllers: [LabsController],
      providers: [{ provide: LabsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: 'u1' };
          return true;
        },
      })
      .compile();

    const allowApp = allowModule.createNestApplication();
    await allowApp.init();

    const startRes = await request(allowApp.getHttpServer()).post('/labs/lab-1/start');
    expect(startRes.status).toBeGreaterThanOrEqual(200);
    expect(startRes.status).toBeLessThan(300);
    expect(mockService.startLabSession).toHaveBeenCalledWith('lab-1', 'u1');

    const completeRes = await request(allowApp.getHttpServer())
      .post('/labs/lab-1/complete')
      .send({ completedObjectives: [] });
    expect(completeRes.status).toBeGreaterThanOrEqual(200);
    expect(mockService.completeLab).toHaveBeenCalledWith('lab-1', 'u1', []);

    const sessionsRes = await request(allowApp.getHttpServer()).get('/labs/sessions/my');
    expect(sessionsRes.status).toBeGreaterThanOrEqual(200);
    expect(mockService.getUserLabSessions).toHaveBeenCalledWith('u1');

    await allowApp.close();
  });
});
