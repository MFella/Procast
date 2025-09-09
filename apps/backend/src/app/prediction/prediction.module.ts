import { Module } from '@nestjs/common';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { BullModule } from '@nestjs/bullmq';
import { PredictionConsumer } from '../_queues/consumers/train-model.consumer';
import { TrainModelWorker } from '../_workers/train-model.worker';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'prediction',
    }),
  ],
  controllers: [PredictionController, TrainModelWorker],
  providers: [PredictionService, PredictionConsumer],
})
export class PredictionModule {}
