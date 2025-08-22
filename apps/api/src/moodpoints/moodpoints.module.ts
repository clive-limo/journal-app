import { Module } from '@nestjs/common';
import { MoodPointsService } from './moodpoints.service';
import { MoodPointsController } from './moodpoints.controller';

@Module({
  controllers: [MoodPointsController],
  providers: [MoodPointsService],
  exports: [MoodPointsService],
})
export class MoodpointsModule {}
