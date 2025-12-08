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
import { LabsService } from './labs.service';
import { CreateLabDto, UpdateLabDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('labs')
export class LabsController {
  constructor(private labsService: LabsService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.labsService.findById(id);
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  async startLabSession(@Param('id') id: string, @Request() req: any) {
    return this.labsService.startLabSession(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async completeLab(
    @Param('id') id: string,
    @Body('completedObjectives') completedObjectives: string[],
    @Request() req: any,
  ) {
    return this.labsService.completeLab(id, req.user.userId, completedObjectives);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions/my')
  async getUserLabSessions(@Request() req: any) {
    return this.labsService.getUserLabSessions(req.user.userId);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Get('admin/all')
  async findAll() {
    return this.labsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Post('admin')
  async create(@Body() createLabDto: CreateLabDto) {
    return this.labsService.create(createLabDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN, Role.INSTRUCTOR)
  @Put('admin/:id')
  async update(@Param('id') id: string, @Body() updateLabDto: UpdateLabDto) {
    return this.labsService.update(id, updateLabDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORG_ADMIN)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.labsService.delete(id);
  }
}
