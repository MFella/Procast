import { Module } from '@nestjs/common';
import { PredictionModule } from './prediction/prediction.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CancelRequestInterceptor } from './_interceptors/cancel-request.interceptor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    PredictionModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CancelRequestInterceptor,
    },
  ],
})
export class AppModule {}
