import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TrainModelWorker } from '../../_workers/train-model.worker';
import { ComputeInteractUtil } from '../../util/compute-interact.util';
import { OutputPrediction } from '../../_typings/prediction/prediction.typings';

@Processor({ name: 'prediction' })
export class PredictionConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<OutputPrediction> {
    ComputeInteractUtil.ABORT_CONTROLLER.signal.addEventListener(
      'abort',
      async () => {
        try {
          await job.remove();
        } catch (err: unknown) {
          console.log(err);
        }
      }
    );

    return await TrainModelWorker.trainModel(job.data, job.id);
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    console.log('Queue is completed');
  }

  @OnWorkerEvent('failed')
  onComputationFailed() {
    console.log('Queue failed');
  }
}
