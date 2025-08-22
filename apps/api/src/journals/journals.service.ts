import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { prisma } from '@journal/database';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { AttachUploadedMediaDto } from './dto/attach-uploaded-media.dto';
import { MediaKind } from '@prisma/client';
import { MediaService } from '../media/media.service';
import { isoDateOnly } from '../common/util/time.util';
import { MoodPointsService } from '../moodpoints/moodpoints.service';

@Injectable()
export class JournalsService {
  constructor(
    private readonly moodPoints: MoodPointsService,
    private readonly mediaStorage: MediaService,
  ) {}

  // Helper methods
  private async ensureJournalOwnership(userId: string, journalId: string) {
    const journal = await prisma.journal.findFirst({
      where: {
        id: journalId,
        ownerId: userId,
      },
    });

    if (!journal) {
      throw new ForbiddenException('Access denied to this journal');
    }

    return journal;
  }

  private async ensureEntryOwnership(userId: string, entryId: string) {
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        journal: {
          ownerId: userId,
        },
      },
    });

    if (!entry) {
      throw new ForbiddenException('Access denied to this entry');
    }

    return entry;
  }

  private async connectOrCreateTags(tagNames: string[]) {
    const tags = await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({
          where: { name },
          create: { name },
          update: {},
        }),
      ),
    );

    return {
      connect: tags.map((tag) => ({ id: tag.id })),
    };
  }

  private async updateUserStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) return;

    const lastEntry = streak.lastEntryDate
      ? new Date(streak.lastEntryDate)
      : null;
    if (lastEntry) {
      lastEntry.setHours(0, 0, 0, 0);
    }

    const daysDiff = lastEntry
      ? Math.floor(
          (today.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    let newCurrentStreak = streak.currentStreak;

    if (daysDiff === 1) {
      newCurrentStreak = streak.currentStreak + 1;
    } else if (daysDiff > 1) {
      newCurrentStreak = 1;
    }

    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const isNewMonth = streak.currentMonth !== currentMonth;

    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(newCurrentStreak, streak.longestStreak),
        lastEntryDate: today,
        totalEntries: streak.totalEntries + 1,
        monthlyCount: isNewMonth ? 1 : streak.monthlyCount + 1,
        currentMonth,
      },
    });
  }

  // Journal CRUD
  async createJournal(userId: string, dto: CreateJournalDto) {
    return prisma.journal.create({
      data: {
        title: dto.title || 'Untitled Journal',
        ownerId: userId,
      },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  }

  async getJournals(userId: string) {
    return prisma.journal.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJournal(userId: string, journalId: string) {
    const journal = await prisma.journal.findFirst({
      where: {
        id: journalId,
        ownerId: userId,
      },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });

    if (!journal) {
      throw new NotFoundException('Journal not found');
    }

    return journal;
  }

  async updateJournal(
    userId: string,
    journalId: string,
    dto: UpdateJournalDto,
  ) {
    await this.ensureJournalOwnership(userId, journalId);

    return prisma.journal.update({
      where: { id: journalId },
      data: dto,
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  }

  async deleteJournal(userId: string, journalId: string) {
    await this.ensureJournalOwnership(userId, journalId);

    return prisma.journal.delete({
      where: { id: journalId },
    });
  }

  // Entry CRUD
  async createEntry(userId: string, journalId: string, dto: CreateEntryDto) {
    await this.ensureJournalOwnership(userId, journalId);

    const wordCount = dto.body ? dto.body.trim().split(/\s+/).length : 0;
    const snippet = dto.body
      ? dto.body.slice(0, 150) + (dto.body.length > 150 ? '...' : '')
      : null;
    const tagConnect = dto.tags
      ? await this.connectOrCreateTags(dto.tags)
      : undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.entry.create({
        data: {
          journalId,
          kind: dto.kind as any,
          title: dto.title,
          body: dto.body,
          rating: dto.rating,
          moodLabel: dto.moodLabel,
          wordCount,
          snippet,
          ...(tagConnect && { tags: tagConnect }),
        },
        include: {
          tags: true,
          media: true,
          _count: { select: { media: true } },
        },
      });

      const streak = await tx.streak.findUnique({ where: { userId } });
      if (streak) {
        const last = streak.lastEntryDate
          ? new Date(streak.lastEntryDate)
          : null;
        if (last) last.setHours(0, 0, 0, 0);

        const alreadyCountedToday = last && last.getTime() === today.getTime();
        let newCurrent = streak.currentStreak;

        if (!alreadyCountedToday) {
          if (!last) {
            newCurrent = 1;
          } else {
            const daysDiff = Math.floor(
              (today.getTime() - last.getTime()) / 86400000,
            );
            newCurrent = daysDiff === 1 ? streak.currentStreak + 1 : 1;
          }
        }

        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const isNewMonth = streak.currentMonth !== currentMonth;

        await tx.streak.update({
          where: { userId },
          data: {
            currentStreak: newCurrent,
            longestStreak: Math.max(newCurrent, streak.longestStreak),
            lastEntryDate: today,
            totalEntries: streak.totalEntries + 1,
            monthlyCount: isNewMonth
              ? 1
              : alreadyCountedToday
                ? streak.monthlyCount
                : streak.monthlyCount + 1,
            currentMonth,
          },
        });
      }

      return created;
    });

    await this.updateUserStreak(userId);

    // Mood points: recompute daily average if a rating was provided
    if (dto.rating != null) {
      const timezone = await this.moodPoints.getUserTimezone(userId);
      const dayIso = isoDateOnly(today, timezone);
      setImmediate(() => this.moodPoints.recomputeFromEntries(userId, dayIso));
    }

    return entry;
  }

  async getEntries(
    userId: string,
    journalId: string,
    options?: {
      kind?: string;
      isDraft?: boolean;
      limit?: number;
      offset?: number;
    },
  ) {
    await this.ensureJournalOwnership(userId, journalId);

    return prisma.entry.findMany({
      where: {
        journalId,
        deletedAt: null,
        ...(options?.kind && { kind: options.kind as any }),
        ...(options?.isDraft !== undefined && { isDraft: options.isDraft }),
      },
      include: {
        tags: true,
        _count: {
          select: { media: true },
        },
      },
      orderBy: { entryDate: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    });
  }

  async getEntry(userId: string, entryId: string) {
    const entry = await prisma.entry.findFirst({
      where: {
        id: entryId,
        deletedAt: null,
        journal: {
          ownerId: userId,
        },
      },
      include: {
        tags: true,
        media: true,
        journal: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    return entry;
  }

  async updateEntry(userId: string, entryId: string, dto: UpdateEntryDto) {
    await this.ensureEntryOwnership(userId, entryId);

    const wordCount = dto.body ? dto.body.split(/\s+/).length : undefined;
    const snippet = dto.body
      ? dto.body.substring(0, 150) + (dto.body.length > 150 ? '...' : '')
      : undefined;

    const tagConnect = dto.tags
      ? await this.connectOrCreateTags(dto.tags)
      : undefined;

    const { tags, ...rest } = dto;

    const updated = await prisma.entry.update({
      where: { id: entryId },
      data: {
        ...rest,
        wordCount,
        snippet,
        ...(tagConnect && {
          tags: {
            set: [],
            ...tagConnect,
          },
        }),
      },
      include: {
        tags: true,
        media: true,
      },
    });

    // Mood points: recompute if rating changed
    if (dto.rating !== undefined) {
      const entry = await this.getEntry(userId, entryId);
      const timezone = await this.moodPoints.getUserTimezone(userId);
      const dayIso = isoDateOnly(entry.entryDate, timezone);
      setImmediate(() => this.moodPoints.recomputeFromEntries(userId, dayIso));
    }

    return updated;
  }

  async deleteEntry(userId: string, entryId: string) {
    await this.ensureEntryOwnership(userId, entryId);

    return prisma.entry.update({
      where: { id: entryId },
      data: { deletedAt: new Date() },
    });
  }

  // Media entries
  async attachUploadedMedia(
    userId: string,
    entryId: string,
    dto: AttachUploadedMediaDto,
  ) {
    await this.ensureEntryOwnership(userId, entryId);

    const meta = await this.mediaStorage.resolveUploadedObject(userId, dto.key);
    const kind: MediaKind = meta.contentType?.startsWith('image/')
      ? MediaKind.IMAGE
      : MediaKind.AUDIO;

    const url = meta.url;
    const thumbUrl = dto.thumbKey
      ? this.mediaStorage.publicUrl(dto.thumbKey)
      : null;

    return prisma.media.create({
      data: {
        entryId,
        kind,
        url,
        thumbUrl,
        durationS: dto.durationS ?? null,
        width: dto.width ?? null,
        height: dto.height ?? null,
        fileName: dto.key.split('/').pop() || null,
        fileSize: meta.size,
        mimeType: meta.contentType,
      },
    });
  }

  async listEntryMedia(userId: string, entryId: string) {
    await this.ensureEntryOwnership(userId, entryId);
    return prisma.media.findMany({
      where: { entryId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteMedia(userId: string, mediaId: string) {
    const media = await prisma.media.findFirst({
      where: {
        id: mediaId,
        deletedAt: null,
        entry: { journal: { ownerId: userId } },
      },
      select: { id: true },
    });
    if (!media) throw new NotFoundException('Media not found');
    return prisma.media.update({
      where: { id: mediaId },
      data: { deletedAt: new Date() },
    });
  }
}
