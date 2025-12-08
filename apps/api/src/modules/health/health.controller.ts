import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    let db = 'unknown';
    try {
      // simple lightweight DB check
      // $queryRaw with a literal is fine for a basic ping
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch (err) {
      db = 'error';
    }

    return {
      status: db === 'ok' ? 'ok' : 'error',
      uptime: process.uptime(),
      timestamp: Date.now(),
      env: process.env.NODE_ENV || 'development',
      db,
    };
  }

  @Get()
  root() {
    return {
      service: 'zeroday-institute-api',
      apiPrefix: process.env.API_PREFIX || 'api/v1',
      docs: `/${process.env.API_PREFIX || 'api/v1'}/docs`,
      port: process.env.PORT || '4000',
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  }
}
