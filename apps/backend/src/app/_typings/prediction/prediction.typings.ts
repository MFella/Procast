import {
  LayersModel,
  Rank,
  Tensor,
  Tensor2D,
  Tensor3D,
} from '@tensorflow/tfjs';
import { TrainingConfig } from './training.typings';

export type PredictionSequence = {
  inputTensor: Tensor<Rank.R3>;
  outputTensor: Tensor<Rank.R2>;
};

export type OutputPrediction = [number, number];

export type ComputationStatus = 'pended' | 'compiled' | 'training' | 'trained';

export type WorkerMessage = {
  fit: {
    trainingConfig: TrainingConfig;
    epochs: number;
    batchSize: number;
    lastDataFromPast: number[][];
  } & PredictionSequence;
};

type WorkerInputData<T extends keyof WorkerMessage> = {
  message: T;
  data: WorkerMessage[T];
};

export type ComputationWorkerInputData = WorkerInputData<'fit'>;
