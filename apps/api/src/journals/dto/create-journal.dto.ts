import { IsString, IsOptional } from 'class-validator';

export class CreateJournalDto {
  @IsString()
  @IsOptional()
  title?: string;
}
