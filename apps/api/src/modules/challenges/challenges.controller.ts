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
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto, UpdateChallengeDto, SubmitFlagDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('challenges')
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  @Public()
  @Get()
  async findAll() {
    return this.challengesService.findAll(false);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.challengesService.findById(id);
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  async submitFlag(
    @Param('id') id: string,
    @Body() submitFlagDto: SubmitFlagDto,
    @Request() req: any,
  ) {
    return this.challengesService.submitFlag(id, req.user.userId, submitFlagDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/submissions')
  async getUserSubmissions(@Param('id') id: string, @Request() req: any) {
    return this.challengesService.getUserSubmissions(id, req.user.userId);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Get('admin/all')
  async findAllAdmin() {
    return this.challengesService.findAll(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Post('admin')
  async create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengesService.create(createChallengeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Put('admin/:id')
  async update(@Param('id') id: string, @Body() updateChallengeDto: UpdateChallengeDto) {
    return this.challengesService.update(id, updateChallengeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.challengesService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Get('admin/:id/submissions')
  async getAllSubmissions(@Param('id') id: string) {
    return this.challengesService.getAllSubmissions(id);
  }
}
