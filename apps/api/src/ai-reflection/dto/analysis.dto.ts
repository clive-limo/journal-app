import { EntryKind } from '@journal/database';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateAnalysisDto {
  @IsString()
  @IsNotEmpty()
  entryContent: string;

  @IsString()
  @IsEnum(EntryKind)
  entryType: string;
}

export class CreateReflectionDto {
  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsString()
  entryContent?: string;

  conversationContext?: Array<{
    role: string;
    content: string;
  }>;
}

export class InitializeChatDto {
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
