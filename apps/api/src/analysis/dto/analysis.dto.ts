import {
  IsString,
  IsInt,
  IsOptional,
  IsObject,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MoodDto {
  @IsString()
  primary: string;

  @IsOptional()
  @IsString()
  secondary?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @IsString()
  color: string;
}

export class ThemeDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Max(10)
  strength: number;
}

export class PatternsDto {
  @IsOptional()
  @IsString()
  writingTime?: string;

  @IsOptional()
  @IsInt()
  wordCount?: number;

  @IsOptional()
  @IsString()
  sentiment?: string;

  @IsOptional()
  @IsString()
  frequency?: string;
}

export interface JsonThemes {
  data: ThemeDto[];
  [key: string]: any;
}

export interface JsonPatterns {
  data: PatternsDto;
  [key: string]: any;
}

export class CreateAiAnalysisDto {
  @IsString()
  entryId: string;

  @ValidateNested()
  @Type(() => MoodDto)
  mood: MoodDto;

  @ValidateNested({ each: true })
  @Type(() => ThemeDto)
  themes: JsonThemes;

  @IsArray()
  @IsString({ each: true })
  insights: string[];

  @ValidateNested()
  @Type(() => PatternsDto)
  patterns: JsonPatterns;

  @IsArray()
  @IsString({ each: true })
  suggestions: string[];

  @IsOptional()
  @IsObject()
  raw?: any;
}

export class UpdateAiAnalysisDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MoodDto)
  mood?: MoodDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThemeDto)
  themes?: ThemeDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  insights?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PatternsDto)
  patterns?: PatternsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];

  @IsOptional()
  @IsObject()
  raw?: any;
}
