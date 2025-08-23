import { Module } from '@nestjs/common';
import { MoodPointsService } from './moodpoints.service';
import { MoodPointsController } from './moodpoints.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MoodPointsController],
  providers: [MoodPointsService],
  exports: [MoodPointsService],
})
export class MoodpointsModule {}
