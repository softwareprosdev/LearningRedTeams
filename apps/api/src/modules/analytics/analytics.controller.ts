import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('courses/:id')
  async getCourseAnalytics(@Param('id') id: string) {
    const analytics = await this.analyticsService.getCourseAnalytics(id);

    if (!analytics) {
      throw new NotFoundException('Course not found');
    }

    return analytics;
  }

  @Get('students')
  async getStudents() {
    return this.analyticsService.getStudents();
  }

  @Get('students/:id')
  async getStudentProgress(@Param('id') id: string) {
    const progress = await this.analyticsService.getStudentProgress(id);

    if (!progress) {
      throw new NotFoundException('Student not found');
    }

    return progress;
  }
}
