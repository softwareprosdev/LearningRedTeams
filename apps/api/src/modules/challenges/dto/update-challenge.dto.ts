import { IsString, IsEnum, IsInt, Min, IsBoolean, IsOptional, IsJSON, IsArray } from 'class-validator';

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsString()
  flag?: string;

  @IsOptional()
  @IsString()
  flagFormat?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsJSON()
  files?: any;

  @IsOptional()
  @IsJSON()
  hints?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mitreTechniqueIds?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
