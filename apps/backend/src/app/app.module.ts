import { Module } from '@nestjs/common';
import { PredictionModule } from './prediction/prediction.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        port: 6379,
        host: 'localhost',
      },
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: true,
      },
    }),
    PredictionModule,
  ],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CancelRequestInterceptor,
    // },
  ],
})
export class AppModule {}
