import { IsString, IsInt, Min, IsJSON, IsOptional } from 'class-validator';

export class CreateLabDto {
  @IsString()
  lessonId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  templateId: string;

  @IsJSON()
  networkTopology: any;

  @IsJSON()
  objectives: any; // [{id, title, description, points}]

  @IsInt()
  @Min(1)
  estimatedTime: number; // minutes

  @IsOptional()
  @IsJSON()
  hints?: any; // [{order, content}]
}
