import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JournalsModule } from './journals/journals.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MoodpointsModule } from './moodpoints/moodpoints.module';
import { MediaModule } from './media/media.module';
import { AIReflectionModule } from './ai-reflection/ai-reflection.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 500,
      },
    ]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    AuthModule,
    JournalsModule,
    MoodpointsModule,
    MediaModule,
    AIReflectionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
