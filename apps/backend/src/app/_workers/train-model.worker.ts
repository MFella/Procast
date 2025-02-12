import { CacheModelUtil } from '../prediction/cache-model.util';
import { ComputeInteractUtil } from '../util/compute-interact.util';
import { tensor2d, tensor3d } from '@tensorflow/tfjs';
import {
  ComputationStatus,
  PredictionSequence,
  type OutputPrediction,
} from '../_typings/prediction/prediction.typings';
import { resolve } from 'path';
import { WorkerMessageFitPayload } from '../_typings/prediction/training.typings';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

export const filename = resolve(__filename);

type ComputationProgress = {
  progress: number;
  jobId: string;
};

export class TrainModelWorker {
  private static readonly DEFAULT_DATA_INPUT_LENGTH = 12;
  private static readonly DEFAULT_DATA_OUTPUT: OutputPrediction = [0, 0];
  private static readonly COMPUTATION_PROGRESS$: BehaviorSubject<ComputationProgress> =
    new BehaviorSubject<ComputationProgress>(void 0);

  constructor() {}

  @GrpcStreamMethod('PredictionService')
  observeStatus(
    jobId: string
  ): Observable<Pick<ComputationProgress, 'progress'>> {
    return TrainModelWorker.COMPUTATION_PROGRESS$.asObservable().pipe(
      filter((computationProgress) => computationProgress?.jobId === jobId),
      map((computationProgress) => {
        delete computationProgress.jobId;
        return computationProgress satisfies Pick<
          ComputationProgress,
          'progress'
        >;
      })
    );
  }

  static async trainModel(
    workerMessageFitPayload: WorkerMessageFitPayload,
    jobId: string
  ): Promise<OutputPrediction> {
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
    ComputeInteractUtil.COMPUTATION_STATUS$.next('compiled');

    // Train the model using the data.
    ComputeInteractUtil.COMPUTATION_STATUS$.next('training');

    await model.fit(inputTensor, outputTensor, {
      epochs,
      batchSize,
      verbose: 0,
      callbacks: {
        onTrainBegin: () => {
          TrainModelWorker.COMPUTATION_PROGRESS$.next({
            jobId,
            progress: 0,
          });
        },
        onTrainEnd: () => {
          TrainModelWorker.COMPUTATION_PROGRESS$.next({
            jobId,
            progress: 100,
          });
        },
        onEpochBegin: async (epoch) => {
          const progressValue = Math.floor(
            (epoch / (epochs * batchSize)) * 100
          );
          if (progressValue % 10 === 0) {
            console.log('Progress: ' + progressValue);
            TrainModelWorker.COMPUTATION_PROGRESS$.next({
              jobId,
              progress: progressValue,
            });
          }
        },
      },
    });

    ComputeInteractUtil.COMPUTATION_STATUS$.next('trained');
    const lastDataFromPastTensor = tensor3d([lastDataFromPast]);

    const prediction = model.predict(lastDataFromPastTensor) as any;
    const result = Object.values(prediction.dataSync()) as OutputPrediction;

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

    let inputSequence: any = [];
    const outputSequence: any = [];

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
