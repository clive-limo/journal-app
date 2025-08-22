import { ForbiddenException, Injectable } from '@nestjs/common';
import { prisma } from '@journal/database';
import {
  endOfDay,
  isoDateOnly,
  startOfDay,
  tzNow,
} from '../common/util/time.util';
import { UpsertMoodDto } from './dto/upsert-mood.dto';
import { QueryRangeDto } from './dto/query-range.dto';
import { DateTime } from 'luxon';

@Injectable()
export class MoodPointsService {
  private colorFor(score: number) {
    if (score >= 8) return '#31A288';
    if (score >= 5) return '#F7BF46';
    if (score >= 3) return '#EDC843';
    return '#F7BF46';
  }

  async getUserTimezone(userId: string) {
    const preffered = await prisma.userPreferences.findUnique({
      where: { userId },
      select: { timezone: true },
    });
    return preffered?.timezone || 'UTC';
  }

  // upsert mood point for a given day
  async upsert(userId: string, dto: UpsertMoodDto) {
    const timezone = await this.getUserTimezone(userId);
    const dayISO = dto.day ?? isoDateOnly(tzNow(timezone).toJSDate(), timezone);
    const day = new Date(dayISO);

    const color = dto.color ?? this.colorFor(dto.score);

    return prisma.moodPoint.upsert({
      where: { userId_day: { userId, day } },
      update: { score: dto.score, emotion: dto.emotion, color },
      create: { userId, day, score: dto.score, emotion: dto.emotion, color },
    });
  }

  // recompute mood point from that day's entry ratings
  async recomputeFromEntries(userId: string, dayLike: Date | string) {
    const timezone = await this.getUserTimezone(userId);
    const start = startOfDay(dayLike, timezone);
    const end = endOfDay(dayLike, timezone);

    const entries = await prisma.entry.findMany({
      where: {
        deletedAt: null,
        rating: { not: null },
        journal: { ownerId: userId },
        entryDate: { gte: start, lte: end },
      },
      select: { rating: true },
    });

    if (entries.length === 0) {
      await prisma.moodPoint.deleteMany({
        where: { userId, day: new Date(isoDateOnly(start, timezone)) },
      });
      return null;
    }

    const avg =
      Math.round(
        (entries.reduce((s, e) => s + (e.rating ?? 0), 0) / entries.length) *
          10,
      ) / 10;
    return this.upsert(userId, {
      score: Math.round(avg),
      day: isoDateOnly(start, timezone),
    });
  }
  // Get mood points within a 7 day range
  async getRange(userId: string, q: QueryRangeDto) {
    const timezone = await this.getUserTimezone(userId);

    const toIso = q.to ?? isoDateOnly(tzNow(timezone).toJSDate(), timezone);
    const fromIso =
      q.from ??
      isoDateOnly(tzNow(timezone).minus({ days: 6 }).toJSDate(), timezone);

    const from = new Date(fromIso);
    const to = new Date(toIso);

    const data = await prisma.moodPoint.findMany({
      where: { userId, day: { gte: from, lte: to }, deletedAt: null },
      orderBy: { day: 'asc' },
      select: { day: true, score: true, color: true, emotion: true },
    });
    return { from: fromIso, to: toIso, points: data };
  }

  // Weekly buckets for the Mood Chart
  async weeklyProfile(userId: string, weeks = 4) {
    const timezone = await this.getUserTimezone(userId);
    const end = tzNow(timezone).endOf('day');
    const start = end.minus({ weeks }).startOf('week');

    const rows = await prisma.moodPoint.findMany({
      where: {
        userId,
        day: {
          gte: new Date(start.toISODate()!),
          lte: new Date(end.toISODate()!),
        },
        deletedAt: null,
      },
      select: { day: true, score: true },
    });

    const sums = Array(7).fill(0);
    const counts = Array(7).fill(0);

    for (const r of rows) {
      const i = DateTime.fromJSDate(r.day).setZone(timezone).weekday % 7;
      sums[i] += r.score;
      counts[i] += 1;
    }

    const bars = sums.map((s, i) =>
      counts[i] ? Math.round(s / counts[i]) : 0,
    );

    return {
      labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

      data: [bars[6], bars[0], bars[1], bars[2], bars[3], bars[4], bars[5]],
    };
  }

  async deleteForDay(userId: string, dayIso: string) {
    const deleted = await prisma.moodPoint.deleteMany({
      where: { userId, day: new Date(dayIso) },
    });
    if (!deleted.count) throw new ForbiddenException('Nothing to delete');
    return { deleted: true, day: dayIso };
  }
}
