import { IsString, IsEnum, IsInt, Min, IsOptional, IsArray, IsBoolean } from 'class-validator';

export enum LessonType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
  QUIZ = 'QUIZ',
  LAB = 'LAB',
  CHALLENGE = 'CHALLENGE',
}

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsEnum(LessonType)
  type: LessonType;

  @IsInt()
  @Min(0)
  order: number;

  @IsString()
  moduleId: string;

  // Video lesson fields
  @IsOptional()
  @IsString()
  videoId?: string;

  // Text lesson fields
  @IsOptional()
  @IsString()
  textContent?: string;

  // Quiz lesson fields
  @IsOptional()
  @IsString()
  quizId?: string;

  // Lab lesson fields
  @IsOptional()
  @IsString()
  labId?: string;

  // Challenge lesson fields
  @IsOptional()
  @IsString()
  challengeId?: string;

  // Resources
  @IsOptional()
  resources?: any; // JSON array of {title, url, type}

  // Preview settings
  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;
}
