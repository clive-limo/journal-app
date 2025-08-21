import { IsString, IsOptional } from 'class-validator';

export class UpdateJournalDto {
  @IsString()
  @IsOptional()
  title?: string;
}
