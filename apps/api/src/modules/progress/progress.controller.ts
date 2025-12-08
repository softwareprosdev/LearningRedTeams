import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('lessons/:lessonId/start')
  @HttpCode(HttpStatus.OK)
  async startLesson(
    @CurrentUser() user: any,
    @Param('lessonId') lessonId: string,
  ) {
    return this.progressService.startLesson(user.id, lessonId);
  }

  @Put('lessons/:lessonId/complete')
  async completeLesson(
    @CurrentUser() user: any,
    @Param('lessonId') lessonId: string,
  ) {
    return this.progressService.completeLesson(user.id, lessonId);
  }

  @Put('lessons/:lessonId/update')
  async updateProgress(
    @CurrentUser() user: any,
    @Param('lessonId') lessonId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.updateProgress(
      user.id,
      lessonId,
      updateProgressDto,
    );
  }

  @Get('courses/:courseId')
  async getCourseProgress(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getCourseProgress(user.id, courseId);
  }
}
