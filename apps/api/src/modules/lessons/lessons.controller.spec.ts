import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

describe('LessonsController (integration)', () => {
  let app: INestApplication;

  const mockLessonsService = {
    submitQuiz: jest.fn().mockResolvedValue({ score: 100, passed: true }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [{ provide: LessonsService, useValue: mockLessonsService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
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
    expect(mockLessonsService.submitQuiz).toHaveBeenCalledWith(undefined, 'lesson-123', { q1: 'a', q2: 'b' });
  });
});
