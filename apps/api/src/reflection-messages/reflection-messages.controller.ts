import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ReflectionMessageService } from './reflection-messages.service';
import {
  CreateReflectionMessageDto,
  SaveReflectionMessagesDto,
} from './dto/reflection-messages.dto';

@Controller('reflection-messages')
export class ReflectionMessageController {
  constructor(
    private readonly reflectionMessageService: ReflectionMessageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReflectionMessage(@Body() dto: CreateReflectionMessageDto) {
    return await this.reflectionMessageService.createReflectionMessage(dto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async saveReflectionMessages(@Body() dto: SaveReflectionMessagesDto) {
    return await this.reflectionMessageService.saveReflectionMessages(dto);
  }

  @Get('entry/:entryId')
  async getReflectionMessagesByEntry(@Param('entryId') entryId: string) {
    return await this.reflectionMessageService.getReflectionMessagesByEntry(
      entryId,
    );
  }

  @Put(':id')
  async updateReflectionMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return await this.reflectionMessageService.updateReflectionMessage(
      id,
      body.content,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReflectionMessage(@Param('id') id: string) {
    return await this.reflectionMessageService.deleteReflectionMessage(id);
  }
}
