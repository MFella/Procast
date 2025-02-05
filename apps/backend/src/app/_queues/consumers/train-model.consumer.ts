import { Processor, Process, OnQueueProgress } from '@nestjs/bull';
import { Job } from 'bullmq';
import { OutputPrediction } from '../../_typings/prediction/prediction.typings';
import trainModel from '../../_workers/train-model.worker';
import { WorkerMessageFitPayload } from '../../_typings/prediction/training.typings';
import { WorkerHost } from '@nestjs/bullmq';
import { ComputeInteractUtil } from '../../util/compute-interact.util';

@Processor('trainModel')
export class TrainModelConsumer extends WorkerHost {
  @Process()
  async process(
    job: Job<WorkerMessageFitPayload, any, string>
  ): Promise<OutputPrediction> {
    ComputeInteractUtil.ABORT_CONTROLLER.signal.onabort = async () => {
      await this.worker.pause();
      await this.worker.close();
    };
    return await trainModel(job.data, job.updateProgress);
  }

  @OnQueueProgress()
  async sendProgressToClient(job: Job, progress: number): Promise<void> {
    console.log('here is progress ' + progress);
  }
}
