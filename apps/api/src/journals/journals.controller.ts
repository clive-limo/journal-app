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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JournalsService } from './journals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { CreateEntryDto } from './dto/create-entry.dto';

@ApiTags('Journals')
@ApiBearerAuth()
@Controller('journals')
@UseGuards(JwtAuthGuard)
export class JournalsController {
  constructor(private journalsService: JournalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a journal' })
  @ApiBody({ type: CreateJournalDto })
  @ApiCreatedResponse({ description: 'Journal created' })
  createJournal(@CurrentUser() user: any, @Body() dto: CreateJournalDto) {
    return this.journalsService.createJournal(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my journals' })
  @ApiOkResponse({ description: 'Array of journals' })
  getJournals(@CurrentUser() user: any) {
    return this.journalsService.getJournals(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a journal by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Journal detail' })
  getJournal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.journalsService.getJournal(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a journal' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateJournalDto })
  @ApiOkResponse({ description: 'Updated journal' })
  updateJournal(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    return this.journalsService.updateJournal(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a journal' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Deleted journal' })
  deleteJournal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.journalsService.deleteJournal(user.id, id);
  }

  @Post(':journalId/entries')
  @ApiOperation({ summary: 'Create an entry in a journal' })
  @ApiParam({ name: 'journalId', type: String })
  @ApiBody({ type: CreateEntryDto })
  @ApiCreatedResponse({ description: 'Entry created' })
  createEntry(
    @CurrentUser() user: any,
    @Param('journalId') journalId: string,
    @Body() dto: CreateEntryDto,
  ) {
    return this.journalsService.createEntry(user.id, journalId, dto);
  }

  @Get(':journalId/entries')
  @ApiOperation({ summary: 'List entries in a journal' })
  @ApiParam({ name: 'journalId', type: String })
  @ApiQuery({ name: 'kind', required: false, enum: ['WRITE', 'TALK', 'DRAW'] })
  @ApiQuery({ name: 'isDraft', required: false, type: Boolean, example: false })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiOkResponse({ description: 'Array of entries' })
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
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }
}
