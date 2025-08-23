import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MoodPointsService } from './moodpoints.service';
import { UpsertMoodDto } from './dto/upsert-mood.dto';
import { QueryRangeDto } from './dto/query-range.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class WeeklyProfileResponse {
  labels!: string[];
  data!: number[];
}
class RangeResponse {
  from!: string;
  to!: string;
  points!: { day: string; score: number; color?: string; emotion?: string }[];
}

@ApiTags('Mood Points')
@ApiBearerAuth()
@Controller('mood-points')
@UseGuards(JwtAuthGuard)
export class MoodPointsController {
  constructor(private readonly moodPointService: MoodPointsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update today’s mood point' })
  @ApiBody({ type: UpsertMoodDto })
  @ApiOkResponse({ description: 'Upserted mood point' })
  async upsert(@CurrentUser() userId: string, @Body() dto: UpsertMoodDto) {
    return this.moodPointService.upsert(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get mood points in a date range' })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @ApiOkResponse({ type: RangeResponse })
  async range(@CurrentUser() userId: string, @Query() q: QueryRangeDto) {
    return this.moodPointService.getRange(userId, q);
  }

  @Get('weekly-profile')
  @ApiOperation({ summary: 'Get weekly average profile for the chart' })
  @ApiOkResponse({ type: WeeklyProfileResponse })
  async weekly(@CurrentUser() userId: string) {
    return this.moodPointService.weeklyProfile(userId, 4);
  }

  @Post('recompute-day')
  @ApiOperation({ summary: 'Recompute a day from entry ratings' })
  @ApiBody({
    schema: { properties: { day: { type: 'string', example: '2025-08-22' } } },
  })
  async recompute(@CurrentUser() userId: string, @Body('day') day: string) {
    return this.moodPointService.recomputeFromEntries(userId, day);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a mood point for a day' })
  @ApiQuery({ name: 'day', required: true, description: 'YYYY-MM-DD' })
  async remove(@CurrentUser() userId: string, @Query('day') day: string) {
    return this.moodPointService.deleteForDay(userId, day);
  }
}
