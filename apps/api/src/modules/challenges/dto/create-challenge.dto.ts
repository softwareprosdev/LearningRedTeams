import { IsString, IsEnum, IsInt, Min, IsBoolean, IsOptional, IsJSON, IsArray } from 'class-validator';

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export class CreateChallengeDto {
  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsOptional()
  @IsString()
  flag?: string; // Static flag

  @IsOptional()
  @IsString()
  flagFormat?: string; // For dynamic flags

  @IsInt()
  @Min(1)
  points: number;

  @IsOptional()
  @IsJSON()
  files?: any; // [{name, url, size}]

  @IsOptional()
  @IsJSON()
  hints?: any; // [{order, content, penaltyPoints}]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mitreTechniqueIds?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
