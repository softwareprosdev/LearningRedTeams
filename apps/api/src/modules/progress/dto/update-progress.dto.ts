import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  watchTime?: number;
}
