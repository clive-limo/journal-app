import { prisma } from '@journal/database';
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { AiAnalysis } from '@prisma/client';
import { CreateAiAnalysisDto, UpdateAiAnalysisDto } from './dto/analysis.dto';

@Injectable()
export class AiAnalysisService {
  async createAnalysis(dto: CreateAiAnalysisDto): Promise<AiAnalysis> {
    try {
      const entryExists = await prisma.entry.findUnique({
        where: { id: dto.entryId },
        select: { id: true },
      });

      if (!entryExists) {
        throw new BadRequestException(`Entry with id ${dto.entryId} not found`);
      }

      const existingAnalysis = await prisma.aiAnalysis.findUnique({
        where: { entryId: dto.entryId },
      });

      if (existingAnalysis) {
        throw new ConflictException(
          `Analysis already exists for entry ${dto.entryId}`,
        );
      }

      return await prisma.aiAnalysis.create({
        data: {
          entryId: dto.entryId,
          moodPrimary: dto.mood.primary,
          moodSecondary: dto.mood.secondary,
          moodScore: dto.mood.score,
          color: dto.mood.color,
          themes: dto.themes,
          insights: dto.insights,
          patterns: dto.patterns,
          suggestions: dto.suggestions,
          raw: dto.raw || null,
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error creating AI analysis:', error);
      throw new BadRequestException('Failed to create AI analysis');
    }
  }

  async createOrUpdateAnalysis(dto: CreateAiAnalysisDto): Promise<AiAnalysis> {
    try {
      const entryExists = await prisma.entry.findUnique({
        where: { id: dto.entryId },
        select: { id: true },
      });

      if (!entryExists) {
        throw new BadRequestException(`Entry with id ${dto.entryId} not found`);
      }

      return await prisma.aiAnalysis.upsert({
        where: { entryId: dto.entryId },
        update: {
          moodPrimary: dto.mood.primary,
          moodSecondary: dto.mood.secondary,
          moodScore: dto.mood.score,
          color: dto.mood.color,
          themes: dto.themes,
          insights: dto.insights,
          patterns: dto.patterns,
          suggestions: dto.suggestions,
          raw: dto.raw || null,
        },
        create: {
          entryId: dto.entryId,
          moodPrimary: dto.mood.primary,
          moodSecondary: dto.mood.secondary,
          moodScore: dto.mood.score,
          color: dto.mood.color,
          themes: dto.themes,
          insights: dto.insights,
          patterns: dto.patterns,
          suggestions: dto.suggestions,
          raw: dto.raw || null,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error upserting AI analysis:', error);
      throw new BadRequestException('Failed to create or update AI analysis');
    }
  }

  async getAnalysisByEntry(entryId: string): Promise<AiAnalysis | null> {
    try {
      return await prisma.aiAnalysis.findUnique({
        where: { entryId },
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve AI analysis');
    }
  }

  async getAnalysisById(id: string): Promise<AiAnalysis> {
    try {
      const analysis = await prisma.aiAnalysis.findUnique({
        where: { id },
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
      });

      if (!analysis) {
        throw new NotFoundException(`Analysis with id ${id} not found`);
      }

      return analysis;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve AI analysis');
    }
  }

  async updateAnalysis(
    id: string,
    dto: UpdateAiAnalysisDto,
  ): Promise<AiAnalysis> {
    try {
      const existingAnalysis = await prisma.aiAnalysis.findUnique({
        where: { id },
      });

      if (!existingAnalysis) {
        throw new NotFoundException(`Analysis with id ${id} not found`);
      }

      const updateData: any = {};

      if (dto.mood) {
        updateData.moodPrimary = dto.mood.primary;
        updateData.moodSecondary = dto.mood.secondary;
        updateData.moodScore = dto.mood.score;
        updateData.color = dto.mood.color;
      }

      if (dto.themes !== undefined) updateData.themes = dto.themes;
      if (dto.insights !== undefined) updateData.insights = dto.insights;
      if (dto.patterns !== undefined) updateData.patterns = dto.patterns;
      if (dto.suggestions !== undefined)
        updateData.suggestions = dto.suggestions;
      if (dto.raw !== undefined) updateData.raw = dto.raw;

      return await prisma.aiAnalysis.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating AI analysis:', error);
      throw new BadRequestException('Failed to update AI analysis');
    }
  }

  async deleteAnalysis(id: string): Promise<AiAnalysis> {
    try {
      const analysis = await prisma.aiAnalysis.findUnique({
        where: { id },
      });

      if (!analysis) {
        throw new NotFoundException(`Analysis with id ${id} not found`);
      }

      return await prisma.aiAnalysis.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete AI analysis');
    }
  }

  async getAnalysesByMood(
    moodPrimary: string,
    limit: number = 10,
  ): Promise<AiAnalysis[]> {
    try {
      return await prisma.aiAnalysis.findMany({
        where: { moodPrimary },
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve analyses by mood');
    }
  }

  async getAnalysesByMoodScoreRange(
    minScore: number,
    maxScore: number,
    limit: number = 10,
  ): Promise<AiAnalysis[]> {
    try {
      return await prisma.aiAnalysis.findMany({
        where: {
          moodScore: {
            gte: minScore,
            lte: maxScore,
          },
        },
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve analyses by mood score range',
      );
    }
  }

  async getRecentAnalyses(limit: number = 10): Promise<AiAnalysis[]> {
    try {
      return await prisma.aiAnalysis.findMany({
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve recent analyses');
    }
  }
}
