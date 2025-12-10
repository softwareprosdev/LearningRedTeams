import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  @Public()
  @Get('module/:moduleId')
  async findByModuleId(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModuleId(moduleId);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.lessonsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit-quiz')
  async submitQuiz(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.lessonsService.submitQuiz(user.id, id, body.answers || {});
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Post('admin')
  async create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Put('admin/:id')
  async update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.lessonsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Put('admin/module/:moduleId/reorder')
  async reorder(
    @Param('moduleId') moduleId: string,
    @Body() body: { lessons: { id: string; order: number }[] },
  ) {
    return this.lessonsService.reorder(moduleId, body.lessons);
  }
}
