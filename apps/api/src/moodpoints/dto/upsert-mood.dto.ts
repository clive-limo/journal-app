import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class UpsertMoodDto {
  @IsInt()
  @Min(0)
  @Max(10)
  score!: number;

  @IsOptional()
  @IsString()
  emotion?: string;

  @IsOptional()
  @IsString()
  color?: string;

  // optional when caller wants to backfill a specific day
  @IsOptional()
  @IsDateString()
  day?: string;
}
