import { CacheModelUtil } from '../prediction/cache-model.util';
import { ComputeInteractUtil } from '../util/compute-interact.util';
import { tensor2d, tensor3d } from '@tensorflow/tfjs';
import {
  PredictionSequence,
  type OutputPrediction,
} from '../_typings/prediction/prediction.typings';
import { resolve } from 'path';
import { WorkerMessageFitPayload } from '../_typings/prediction/training.typings';
import { GrpcMethod } from '@nestjs/microservices';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { Controller } from '@nestjs/common';
import type {
  TensorLike2D,
  TensorLike3D,
} from '../_typings/tensorflow/tfjs_supp';
import { IpcHandler } from '../ipc/ipc.handler';

export const filename = resolve(__filename);

type PredictionStatusRequest = {
  jobId: string;
};

type ComputationProgress = {
  progress: number;
  jobId: string;
  result?: [number, number];
};

@Controller()
export class TrainModelWorker {
  private static readonly DEFAULT_DATA_INPUT_LENGTH = 12;
  private static readonly DEFAULT_DATA_OUTPUT: OutputPrediction = [0, 0];
  static readonly COMPUTATION_PROGRESS$: BehaviorSubject<ComputationProgress> =
    new BehaviorSubject<ComputationProgress>(void 0);

  @GrpcMethod('PredictionService', 'ObserveProgress')
  observeProgress(
    predictionStatusRequest: PredictionStatusRequest
  ): Observable<Pick<ComputationProgress, 'progress' | 'result'>> {
    const jobId = predictionStatusRequest['jobId'];

    return TrainModelWorker.COMPUTATION_PROGRESS$.pipe(
      filter(
        (computationProgress) =>
          !!computationProgress && computationProgress?.jobId === jobId
      ),
      map(({ progress, result }) => {
        return { progress, result };
      })
    );
  }

  static async trainModel(
    workerMessageFitPayload: WorkerMessageFitPayload,
    jobId: string
  ): Promise<OutputPrediction> {
    IpcHandler.sendMessage({
      pid: process.pid,
      jobId,
      action: 'register-training',
    });

    const {
      trainingConfig: {
        optimizer,
        learningRate,
        lossFn,
        helpLayer,
        basicLayer,
      },
      pastData,
      sequenceLength,
      epochs,
      batchSize,
      lastDataFromPast,
    } = workerMessageFitPayload;

    const { inputTensor, outputTensor } =
      TrainModelWorker.createPredictionSequences(pastData, sequenceLength);

    // Define a model for linear regression
    const model = await CacheModelUtil.resolveModel({
      optimizer,
      learningRate,
      lossFn,
      helpLayer,
      basicLayer,
    });

    // Train the model using the data.
    await model.fit(inputTensor, outputTensor, {
      epochs,
      batchSize,
      verbose: 0,
      callbacks: {
        onTrainBegin: () => {
          IpcHandler.sendMessage({
            pid: process.pid,
            computationProgress: 0,
            jobId,
            action: 'training-begin',
          });
        },
        onEpochBegin: async (epoch) => {
          const progressValue = Math.floor(
            (epoch / (epochs * batchSize)) * 100
          );
          if (progressValue % 10 === 0) {
            IpcHandler.sendMessage({
              pid: process.pid,
              computationProgress: progressValue,
              jobId,
              action: 'training-progress',
            });
          }
        },
      },
    });

    ComputeInteractUtil.COMPUTATION_STATUS$.next('trained');
    const lastDataFromPastTensor = tensor3d([lastDataFromPast]);

    const prediction = model.predict(lastDataFromPastTensor) as any;
    const result = Object.values(prediction.dataSync()) as OutputPrediction;

    IpcHandler.sendMessage({
      pid: process.pid,
      result,
      computationProgress: 100,
      jobId,
      action: 'training-progress',
    });
    return result;
  }

  private static createPredictionSequences(
    data: Array<number>,
    inputLength: number = TrainModelWorker.DEFAULT_DATA_INPUT_LENGTH,
    outputLength: number = TrainModelWorker.DEFAULT_DATA_OUTPUT.length
  ): PredictionSequence {
    if (data.length < inputLength + outputLength) {
      throw new Error(
        'Cannot make prediction - provided historical data is too short to train model'
      );
    }

    let inputSequence: TensorLike3D = [];
    const outputSequence: TensorLike2D = [];

    for (let i = 0; i < data.length - inputLength - outputLength; i++) {
      inputSequence.push(data.slice(i, i + inputLength));
      outputSequence.push(
        data.slice(i + inputLength, i + inputLength + outputLength)
      );
    }

    inputSequence = inputSequence.map((input) => input.map((value) => [value]));

    return {
      inputTensor: tensor3d(inputSequence),
      outputTensor: tensor2d(outputSequence),
    };
  }
}
