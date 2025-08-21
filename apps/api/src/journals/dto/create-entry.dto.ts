import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { EntryKind } from '@prisma/client';

export class CreateEntryDto {
  @IsEnum(EntryKind)
  kind: EntryKind;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  moodLabel?: string;

  @IsOptional()
  tags?: string[];
}
