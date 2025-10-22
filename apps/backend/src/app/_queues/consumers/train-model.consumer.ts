import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TrainModelWorker } from '../../_workers/train-model.worker';
import { OutputPrediction } from '../../_typings/prediction/prediction.typings';
import { WorkerMessageFitPayload } from '../../_typings/prediction/training.typings';

@Processor({ name: 'prediction' }, { maxStalledCount: 0 })
export class PredictionConsumer extends WorkerHost {
  async process(
    job: Job<WorkerMessageFitPayload, OutputPrediction, string>
  ): Promise<OutputPrediction> {
    return await TrainModelWorker.trainModel(job.data, job.id);
  }
}
