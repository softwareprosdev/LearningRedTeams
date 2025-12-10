import { Controller, Get, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post('courses/:courseId')
  @HttpCode(HttpStatus.CREATED)
  async enrollInCourse(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.enrollmentsService.enrollUserInCourse(user.id, courseId);
  }

  @Get('my-courses')
  async getMyCourses(@CurrentUser() user: any) {
    return this.enrollmentsService.getUserEnrollments(user.id);
  }

  @Get('course/:courseId')
  async getEnrollmentForCourse(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.enrollmentsService.getUserEnrollmentForCourse(user.id, courseId);
  }
}
