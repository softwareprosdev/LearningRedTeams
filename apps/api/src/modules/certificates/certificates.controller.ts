import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Post('generate/:courseId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async generateCertificate(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.certificatesService.generateCertificate(user.id, courseId);
  }

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  async getMyCertificates(@CurrentUser() user: any) {
    return this.certificatesService.getMyCertificates(user.id);
  }

  @Get(':certificateId')
  @Public()
  async getCertificate(@Param('certificateId') certificateId: string) {
    return this.certificatesService.getCertificateById(certificateId);
  }

  @Get('verify/:certificateId')
  @Public()
  async verifyCertificate(
    @Param('certificateId') certificateId: string,
    @Query('hash') verificationHash: string,
  ) {
    return this.certificatesService.verifyCertificate(certificateId, verificationHash);
  }
}
