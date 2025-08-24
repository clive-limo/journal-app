import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AIReflectionService } from './ai-reflection.service';
import {
  CreateAnalysisDto,
  CreateReflectionDto,
  InitializeChatDto,
} from './dto/analysis.dto';
import {
  AIAnalysis,
  InitialChatResponse,
  ReflectionResponse,
} from './interfaces/ai-analysis.interface';
import { AIServiceException } from './exceptions/ai-service.exceptions';

@Controller('ai-reflection')
export class AIReflectionController {
  constructor(private readonly aiReflectionService: AIReflectionService) {}

  @Post('analyze')
  async analyzeEntry(
    @Body(ValidationPipe) dto: CreateAnalysisDto,
  ): Promise<AIAnalysis> {
    try {
      return await this.aiReflectionService.generateEntryAnalysis(dto);
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reflect')
  async generateReflection(
    @Body(ValidationPipe) dto: CreateReflectionDto,
  ): Promise<ReflectionResponse> {
    try {
      return await this.aiReflectionService.generateReflectionResponse(dto);
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('initialize')
  async initializeChat(
    @Body(ValidationPipe) dto: InitializeChatDto,
  ): Promise<InitialChatResponse> {
    try {
      return await this.aiReflectionService.initializeChat(dto);
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
