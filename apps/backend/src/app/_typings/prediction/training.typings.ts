import { losses } from '@tensorflow/tfjs';
import { WorkerMessage } from './prediction.typings';

export type HelpLayer = 'dropout' | 'batchNormalization';
export type BasicLayer = 'lstm' | 'gru' | 'simpleRNN';

export type Optimizer =
  | 'sgd'
  | 'adam'
  | 'rmsprop'
  | 'adagrad'
  | 'adadelta'
  | 'momentum';

type LossRegressionFn = Exclude<keyof typeof losses, 'cosineDistance'>;

export type LossFn = LossRegressionFn;

export type TrainingConfig = {
  basicLayer: BasicLayer;
  helpLayer: HelpLayer;
  lossFn: LossFn;
  optimizer: Optimizer;
  learningRate?: number;
};

export type WorkerMessageFitPayload = WorkerMessage['fit'];
