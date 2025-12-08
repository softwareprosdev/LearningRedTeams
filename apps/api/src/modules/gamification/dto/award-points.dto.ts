import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum PointEventType {
  LESSON_COMPLETE = 'LESSON_COMPLETE',
  COURSE_COMPLETE = 'COURSE_COMPLETE',
  QUIZ_PERFECT = 'QUIZ_PERFECT',
  LAB_COMPLETE = 'LAB_COMPLETE',
  CHALLENGE_COMPLETE = 'CHALLENGE_COMPLETE',
  CUSTOM = 'CUSTOM',
}

export class AwardPointsDto {
  @IsString()
  userId: string;

  @IsNumber()
  points: number;

  @IsEnum(PointEventType)
  eventType: PointEventType;

  @IsOptional()
  @IsString()
  metadata?: string; // For storing additional event info
}
