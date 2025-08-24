import { EntryKind } from '@journal/database';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

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
