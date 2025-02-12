import { Module } from '@nestjs/common';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { BullModule } from '@nestjs/bullmq';
import { PredictionConsumer } from '../_queues/consumers/train-model.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'prediction',
    }),
  ],
  controllers: [PredictionController],
  providers: [PredictionService, PredictionConsumer],
})
export class PredictionModule {}
