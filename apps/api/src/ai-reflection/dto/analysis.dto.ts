import { EntryKind } from '@journal/database';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class CreateAnalysisDto {
  // @IsString()
  // @IsNotEmpty()
  // entryId: string;

  @IsString()
  @IsNotEmpty()
  entryContent: string;

  @IsString()
  @IsEnum(EntryKind)
  entryType: string;
}

export class CreateReflectionDto {
  // @IsString()
  // @IsNotEmpty()
  // entryId: string;

  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsString()
  entryContent?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  conversationContext?: Array<{
    role: string;
    content: string;
  }>;
}

export class InitializeChatDto {
  // @IsString()
  // @IsNotEmpty()
  // entryId: string;

  @IsString()
  @IsNotEmpty()
  entryContent: string;

  @IsString()
  @IsEnum(EntryKind)
  entryType: string;
}

export class GetDrawingContextDto {
  @IsString()
  @IsOptional()
  mood?: string;

  @IsString()
  @IsOptional()
  theme?: string;
}

export class ProcessImageDto {
  @IsString()
  @IsNotEmpty()
  drawingContext: string;
}

export class ConvertAudioDto {
  // File validation will be handled in controller
}
