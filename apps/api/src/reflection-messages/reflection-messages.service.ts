import { Injectable, BadRequestException } from '@nestjs/common';
import { ReflectionAuthor, ReflectionMessage } from '@prisma/client';
import {
  CreateReflectionMessageDto,
  SaveReflectionMessagesDto,
} from './dto/reflection-messages.dto';
import { prisma } from '@journal/database';

@Injectable()
export class ReflectionMessageService {
  async createReflectionMessage(
    dto: CreateReflectionMessageDto,
  ): Promise<ReflectionMessage> {
    try {
      // Verify that the entry exists
      const entryExists = await prisma.entry.findUnique({
        where: { id: dto.entryId },
        select: { id: true },
      });

      if (!entryExists) {
        throw new BadRequestException(`Entry with id ${dto.entryId} not found`);
      }

      return await prisma.reflectionMessage.create({
        data: {
          entryId: dto.entryId,
          author: dto.author,
          content: dto.content,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create reflection message');
    }
  }

  async saveReflectionMessages(
    dto: SaveReflectionMessagesDto,
  ): Promise<ReflectionMessage[]> {
    try {
      // Verify that the entry exists
      const entryExists = await prisma.entry.findUnique({
        where: { id: dto.entryId },
        select: { id: true },
      });

      if (!entryExists) {
        throw new BadRequestException(`Entry with id ${dto.entryId} not found`);
      }

      const reflectionMessages: ReflectionMessage[] = [];

      for (const message of dto.messages) {
        // Extract the actual message data from the nested structure
        const messageValue = message;

        const author =
          messageValue.role === 'assistant'
            ? ReflectionAuthor.AI
            : ReflectionAuthor.USER;

        // Create content with suggestions if available
        let content = messageValue.content;
        if (messageValue.suggestions && messageValue.suggestions.length > 0) {
          content += `\n\nSuggestions: ${messageValue.suggestions.join(', ')}`;
        }

        const reflectionMessage = await prisma.reflectionMessage.create({
          data: {
            entryId: dto.entryId,
            author,
            content,
          },
        });

        reflectionMessages.push(reflectionMessage);
      }

      return reflectionMessages;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error saving reflection messages:', error);
      throw new BadRequestException('Failed to save reflection messages');
    }
  }

  async getReflectionMessagesByEntry(
    entryId: string,
  ): Promise<ReflectionMessage[]> {
    try {
      return await prisma.reflectionMessage.findMany({
        where: { entryId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve reflection messages');
    }
  }

  async deleteReflectionMessage(id: string): Promise<ReflectionMessage> {
    try {
      return await prisma.reflectionMessage.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete reflection message');
    }
  }

  async updateReflectionMessage(
    id: string,
    content: string,
  ): Promise<ReflectionMessage> {
    try {
      return await prisma.reflectionMessage.update({
        where: { id },
        data: { content },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update reflection message');
    }
  }
}
