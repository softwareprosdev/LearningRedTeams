import { IsString, IsEnum, IsBoolean, IsOptional, IsInt, Min, IsArray } from 'class-validator';

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum Category {
  RED_TEAM = 'RED_TEAM',
  BLUE_TEAM = 'BLUE_TEAM',
  PURPLE_TEAM = 'PURPLE_TEAM',
  GENERAL = 'GENERAL',
}

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsEnum(Category)
  category: Category;

  @IsInt()
  @Min(0)
  price: number; // in cents

  @IsBoolean()
  isFree: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number; // in minutes

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningOutcomes?: string[];
}
