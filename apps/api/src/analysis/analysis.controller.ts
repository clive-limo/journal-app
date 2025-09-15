import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { AiAnalysisService } from './analysis.service';
import { CreateAiAnalysisDto, UpdateAiAnalysisDto } from './dto/analysis.dto';

@Controller('ai-analyses')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAnalysis(@Body() dto: CreateAiAnalysisDto) {
    return await this.aiAnalysisService.createAnalysis(dto);
  }

  @Post('upsert')
  @HttpCode(HttpStatus.OK)
  async createOrUpdateAnalysis(@Body() dto: CreateAiAnalysisDto) {
    return await this.aiAnalysisService.createOrUpdateAnalysis(dto);
  }

  @Get(':id')
  async getAnalysisById(@Param('id') id: string) {
    return await this.aiAnalysisService.getAnalysisById(id);
  }

  @Get('entry/:entryId')
  async getAnalysisByEntry(@Param('entryId') entryId: string) {
    return await this.aiAnalysisService.getAnalysisByEntry(entryId);
  }

  @Get()
  async getRecentAnalyses(@Query('limit', ParseIntPipe) limit: number = 10) {
    return await this.aiAnalysisService.getRecentAnalyses(limit);
  }

  @Get('mood/:moodPrimary')
  async getAnalysesByMood(
    @Param('moodPrimary') moodPrimary: string,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return await this.aiAnalysisService.getAnalysesByMood(moodPrimary, limit);
  }

  @Get('mood-range/:minScore/:maxScore')
  async getAnalysesByMoodScoreRange(
    @Param('minScore', ParseIntPipe) minScore: number,
    @Param('maxScore', ParseIntPipe) maxScore: number,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return await this.aiAnalysisService.getAnalysesByMoodScoreRange(
      minScore,
      maxScore,
      limit,
    );
  }

  @Put(':id')
  async updateAnalysis(
    @Param('id') id: string,
    @Body() dto: UpdateAiAnalysisDto,
  ) {
    return await this.aiAnalysisService.updateAnalysis(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAnalysis(@Param('id') id: string) {
    return await this.aiAnalysisService.deleteAnalysis(id);
  }
}
