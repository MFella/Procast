import { Injectable } from '@nestjs/common';
import type { TrainingConfig } from '../_typings/prediction/training.typings';
import { ScheduledPredictionDTO } from '../_dtos/prediction/scheduled-prediction.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { IpcHandler } from '../ipc/ipc.handler';

@Injectable()
export class PredictionService {
  private static readonly DEFAULT_TRAINING_CONFIG: TrainingConfig = {
    basicLayer: 'lstm',
    helpLayer: 'dropout',
    learningRate: 20,
    lossFn: 'huberLoss',
    optimizer: 'rmsprop',
  };

  private static readonly REQUIRED_DATA_LENGTH = 24;

  constructor(
    @InjectQueue('prediction')
    private predictionQueue: Queue
  ) {}

  async generatePrediction(
    predictionData: Array<number>,
    trainingConfig: TrainingConfig
  ): Promise<ScheduledPredictionDTO> {
    const outputLength = 2;
    const sequenceLength =
      PredictionService.REQUIRED_DATA_LENGTH - outputLength - 1;
    const batchSize = 1;
    const epochSize = 100;

    const pastData = predictionData.slice(
      0,
      PredictionService.REQUIRED_DATA_LENGTH
    );
    if (pastData.length < PredictionService.REQUIRED_DATA_LENGTH) {
      pastData.unshift(
        ...Array(PredictionService.REQUIRED_DATA_LENGTH - pastData.length).fill(
          0
        )
      );
    }

    trainingConfig.optimizer ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.optimizer;
    trainingConfig.learningRate ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.learningRate;
    trainingConfig.lossFn ??= PredictionService.DEFAULT_TRAINING_CONFIG.lossFn;
    trainingConfig.helpLayer ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.helpLayer;
    trainingConfig.basicLayer ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.basicLayer;

    const lastDataFromPast = pastData
      .slice(-sequenceLength)
      .map((value) => [value]);

    const trainModelWorker = await this.predictionQueue.add('trainModel', {
      trainingConfig,
      lastDataFromPast,
      pastData,
      sequenceLength,
      batchSize,
      epochs: epochSize,
      pid: process.pid,
    });

    return {
      jobId: trainModelWorker.id,
    };
  }

  async getCachedPredictionData(jobId: string): Promise<Array<number>> {
    const predictionJob = (await this.predictionQueue.getJob(jobId)) as
      | Job
      | undefined;
    if (!predictionJob) {
      return [];
    }

    return predictionJob.data;
  }

  async stopPrediction(jobId: string): Promise<void> {
    IpcHandler.sendMessage({
      action: 'cancel',
      jobId,
    });
  }
}
