import { IsString } from 'class-validator';

export class SubmitFlagDto {
  @IsString()
  flag: string;
}
