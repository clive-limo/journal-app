import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
  Get,
} from '@nestjs/common';
import { AIReflectionService } from './ai-reflection.service';
import {
  CreateAnalysisDto,
  CreateReflectionDto,
  GetDrawingContextDto,
  InitializeChatDto,
} from './dto/analysis.dto';
import {
  AIAnalysis,
  AudioTranscription,
  DrawingContext,
  ImageAnalysis,
  InitialChatResponse,
  ReflectionResponse,
} from './interfaces/ai-analysis.interface';
import { AIServiceException } from './exceptions/ai-service.exceptions';
import { FileInterceptor } from '@nestjs/platform-express';
import { File as MulterFile } from 'multer';

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

  @Get('drawing-context')
  async getDrawingContext(
    @Query() dto: GetDrawingContextDto,
  ): Promise<DrawingContext> {
    try {
      return await this.aiReflectionService.getDrawingContext(dto);
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

  @Post('process-image')
  @UseInterceptors(FileInterceptor('image'))
  async processImage(
    @UploadedFile() file: MulterFile,
    @Body('drawingContext') drawingContext: string,
  ): Promise<ImageAnalysis> {
    if (!file) {
      throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
    }

    if (!drawingContext) {
      throw new HttpException(
        'Drawing context is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.aiReflectionService.processImage(
        file.buffer,
        drawingContext,
      );
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

  @Post('convert-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async convertAudioToText(
    @UploadedFile() file: MulterFile,
  ): Promise<AudioTranscription> {
    if (!file) {
      throw new HttpException('Audio file is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.aiReflectionService.convertAudioToText(file.buffer);
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
