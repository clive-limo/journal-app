import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReflectionAuthor } from '@prisma/client';

export class CreateReflectionMessageDto {
  @IsString()
  entryId: string;

  @IsEnum(ReflectionAuthor)
  author: ReflectionAuthor;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];
}

export class SaveReflectionMessagesDto {
  @IsString()
  entryId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageData)
  messages: MessageData[];
}

export class MessageData {
  @IsString()
  role: 'user' | 'assistant';

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suggestions?: string[];

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  timestamp?: any;
}
