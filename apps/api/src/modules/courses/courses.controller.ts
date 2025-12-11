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
  Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  @Public()
  @Get()
  async findAll() {
    return this.coursesService.findAll();
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  // ============================================================================
  // ENROLLMENT ENDPOINTS
  // ============================================================================

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll')
  async enroll(@Param('id') id: string, @Request() req: any) {
    return this.enrollmentsService.enrollUserInCourse(req.user.id, id);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Get('admin/all')
  async findAllAdmin() {
    return this.coursesService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Post('admin')
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Put('admin/:id')
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.coursesService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Put('admin/:id/publish')
  async publish(@Param('id') id: string) {
    return this.coursesService.publish(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Put('admin/:id/unpublish')
  async unpublish(@Param('id') id: string) {
    return this.coursesService.unpublish(id);
  }
}
