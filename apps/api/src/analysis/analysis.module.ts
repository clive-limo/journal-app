import { Module } from '@nestjs/common';
import { AiAnalysisController } from './analysis.controller';
import { AiAnalysisService } from './analysis.service';

@Module({
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService],
  exports: [AiAnalysisService],
})
export class AiAnalysisModule {}
