import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AwardPointsDto } from './dto';

@Controller('api/v1/gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.gamificationService.getLeaderboard(limitNum);
  }

  @Get('achievements')
  async getAllAchievements() {
    return this.gamificationService.getAllAchievements();
  }

  // ============================================================================
  // AUTHENTICATED ENDPOINTS
  // ============================================================================

  @Get('my-stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@CurrentUser() user: any) {
    return this.gamificationService.getUserStats(user.id);
  }

  @Get('my-achievements')
  @UseGuards(JwtAuthGuard)
  async getMyAchievements(@CurrentUser() user: any) {
    return this.gamificationService.getUserAchievements(user.id);
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @Post('award-points')
  @UseGuards(JwtAuthGuard)
  async awardPoints(@CurrentUser() user: any, @Body() dto: AwardPointsDto) {
    // TODO: Add admin role check
    // if (user.role !== 'SUPER_ADMIN') {
    //   throw new ForbiddenException('Only admins can award points');
    // }

    return this.gamificationService.awardPoints(dto);
  }

  @Post('seed-achievements')
  @UseGuards(JwtAuthGuard)
  async seedAchievements() {
    // TODO: Add admin role check
    // if (user.role !== 'SUPER_ADMIN') {
    //   throw new ForbiddenException('Only admins can seed achievements');
    // }

    return this.gamificationService.seedAchievements();
  }
}
