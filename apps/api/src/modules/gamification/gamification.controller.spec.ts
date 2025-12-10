import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('GamificationController (integration)', () => {
  let app: INestApplication;
  const mockService = {
    getLeaderboard: jest.fn().mockResolvedValue([{ userId: 'u1', totalPoints: 100 }]),
    getAllAchievements: jest.fn().mockResolvedValue([{ id: 'a1', name: 'First' }]),
    getUserStats: jest.fn().mockResolvedValue({ userId: 'u1', totalPoints: 100 }),
    getUserAchievements: jest.fn().mockResolvedValue([{ id: 'a1', name: 'First' }]),
    awardPoints: jest.fn().mockResolvedValue({ pointsAwarded: 10 }),
    seedAchievements: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [GamificationController],
      providers: [{ provide: GamificationService, useValue: mockService }],
    });

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/gamification/leaderboard (public) returns leaderboard', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/gamification/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([{ userId: 'u1', totalPoints: 100 }]));
    expect(mockService.getLeaderboard).toHaveBeenCalled();
  });

  it('GET /api/v1/gamification/achievements (public) returns achievements', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/gamification/achievements');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([{ id: 'a1', name: 'First' }]));
    expect(mockService.getAllAchievements).toHaveBeenCalled();
  });

  it('authenticated endpoints should 401 when guard denies', async () => {
    // create a new app with guard that denies
    const denyModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [{ provide: GamificationService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => false })
      .compile();

    const denyApp = denyModule.createNestApplication();
    await denyApp.init();

    const res = await request(denyApp.getHttpServer()).get('/api/v1/gamification/my-stats');
    // Guard returning false will produce a 403 Forbidden response in Nest
    expect(res.status).toBe(403);

    await denyApp.close();
  });

  it('authenticated endpoints should work when guard allows and injects user', async () => {
    // create app overriding JwtAuthGuard to set user
    const allowModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [{ provide: GamificationService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: 'u1' };
          return true;
        },
      })
      .compile();

    const allowApp = allowModule.createNestApplication();
    await allowApp.init();

    const res = await request(allowApp.getHttpServer()).get('/api/v1/gamification/my-stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ userId: 'u1', totalPoints: 100 }));
    expect(mockService.getUserStats).toHaveBeenCalledWith('u1');

    // test award-points (POST)
    const awardRes = await request(allowApp.getHttpServer())
      .post('/api/v1/gamification/award-points')
      .send({ userId: 'u1', points: 10, eventType: 'CUSTOM' });
    // controller passes through to service - we mocked response
    // Accept any 2xx success code (201 is returned for POST by default)
    expect(awardRes.status).toBeGreaterThanOrEqual(200);
    expect(awardRes.status).toBeLessThan(300);
    expect(mockService.awardPoints).toHaveBeenCalled();

    // test seed achievements
    const seedRes = await request(allowApp.getHttpServer()).post(
      '/api/v1/gamification/seed-achievements',
    );
    expect(seedRes.status).toBeGreaterThanOrEqual(200);
    expect(seedRes.status).toBeLessThan(300);
    expect(mockService.seedAchievements).toHaveBeenCalled();

    await allowApp.close();
  });
});
