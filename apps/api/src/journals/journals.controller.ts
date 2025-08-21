import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JournalsService } from './journals.service';
import { CurrentUser, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { CreateEntryDto } from './dto/create-entry.dto';

@Controller('journals')
@UseGuards(JwtAuthGuard)
export class JournalsController {
  constructor(private journalsService: JournalsService) {}

  @Post()
  createJournal(@CurrentUser() user: any, @Body() dto: CreateJournalDto) {
    return this.journalsService.createJournal(user.id, dto);
  }

  @Get()
  getJournals(@CurrentUser() user: any) {
    return this.journalsService.getJournals(user.id);
  }

  @Get(':id')
  getJournal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.journalsService.getJournal(user.id, id);
  }

  @Put(':id')
  updateJournal(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    return this.journalsService.updateJournal(user.id, id, dto);
  }

  @Delete(':id')
  deleteJournal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.journalsService.deleteJournal(user.id, id);
  }

  @Post(':journalId/entries')
  createEntry(
    @CurrentUser() user: any,
    @Param('journalId') journalId: string,
    @Body() dto: CreateEntryDto,
  ) {
    return this.journalsService.createEntry(user.id, journalId, dto);
  }

  @Get(':journalId/entries')
  getEntries(
    @CurrentUser() user: any,
    @Param('journalId') journalId: string,
    @Query('kind') kind?: string,
    @Query('isDraft') isDraft?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.journalsService.getEntries(user.id, journalId, {
      kind,
      isDraft: isDraft === 'true',
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }
}
