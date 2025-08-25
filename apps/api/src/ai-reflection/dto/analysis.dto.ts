import { EntryKind } from '@journal/database';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsArray,
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

export class ConversationMessageDto {
  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateReflectionDto {
  // @IsString()
  // @IsNotEmpty()
  // entryId: string;

  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsOptional()
  @IsString()
  entryContent?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  conversationContext?: ConversationMessageDto[];
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
