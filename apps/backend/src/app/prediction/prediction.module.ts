import { Module } from '@nestjs/common';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { BullModule } from '@nestjs/bullmq';
import { TrainModelConsumer } from '../_queues/consumers/train-model.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'trainModel',
      connection: {
        port: 6380,
      },
    }),
  ],
  controllers: [PredictionController],
  providers: [PredictionService, TrainModelConsumer],
})
export class PredictionModule {}
