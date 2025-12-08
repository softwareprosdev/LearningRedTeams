import { IsString, IsInt, Min, IsJSON, IsOptional } from 'class-validator';

export class UpdateLabDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsJSON()
  networkTopology?: any;

  @IsOptional()
  @IsJSON()
  objectives?: any;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;

  @IsOptional()
  @IsJSON()
  hints?: any;
}
