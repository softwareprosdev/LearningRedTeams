import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsString()
  courseId: string;
}
