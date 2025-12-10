import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { LessonsController } from './lessons.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LessonsService } from './lessons.service';

describe('LessonsController (integration)', () => {
  let app: INestApplication;

  const mockLessonsService = {
    submitQuiz: jest.fn().mockResolvedValue({ score: 100, passed: true }),
  };

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [LessonsController],
      providers: [{ provide: LessonsService, useValue: mockLessonsService }],
    });

    // override JwtAuthGuard so it doesn't try to call passport during our lightweight e2e test
    moduleBuilder.overrideGuard(JwtAuthGuard).useValue({
      canActivate: (ctx: any) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: 'test-user' };
        return true;
      },
    });

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    // Replace any Auth guards during this test with a permissive guard that injects a fake user
    app.useGlobalGuards({
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 'test-user' };
        return true;
      },
    } as any);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/lessons/:id/submit-quiz (POST) returns submission result when called', async () => {
    const res = await request(app.getHttpServer())
      .post('/lessons/lesson-123/submit-quiz')
      .send({ answers: { q1: 'a', q2: 'b' } });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.body).toEqual(expect.objectContaining({ score: 100, passed: true }));
    expect(mockLessonsService.submitQuiz).toHaveBeenCalledWith('test-user', 'lesson-123', {
      q1: 'a',
      q2: 'b',
    });
  });
});
