// reflection-message.module.ts
import { Module } from '@nestjs/common';
import { ReflectionMessageController } from './reflection-messages.controller';
import { ReflectionMessageService } from './reflection-messages.service';

@Module({
  controllers: [ReflectionMessageController],
  providers: [ReflectionMessageService],
  exports: [ReflectionMessageService],
})
export class ReflectionMessagesModule {}
