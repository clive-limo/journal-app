import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIReflectionController } from './ai-reflection.controller';
import { AIReflectionService } from './ai-reflection.service';

@Module({
  imports: [ConfigModule],
  controllers: [AIReflectionController],
  providers: [AIReflectionService],
  exports: [AIReflectionService],
})
export class AIReflectionModule {}
