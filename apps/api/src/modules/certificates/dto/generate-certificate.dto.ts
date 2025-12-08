import { IsString } from 'class-validator';

export class GenerateCertificateDto {
  @IsString()
  courseId: string;
}
