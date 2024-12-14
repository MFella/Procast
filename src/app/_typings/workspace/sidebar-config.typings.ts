import { ChartType } from 'chart.js';

export type HelpLayer = 'Dropout' | 'BatchNormalization';
export type BasicLayer = 'LSTM' | 'GRU' | 'SimpleRNN';
export type TensorflowLayerFnMappings = {
  ['LSTM']: 'lstm';
  ['GRU']: 'gru';
  ['SimpleRNN']: 'simpleRNN';
  ['Dropout']: 'dropout';
  ['BatchNormalization']: 'batchNormalization';
};

type LossRegressionFn = 'meanSquaredError' | 'meanAbsoluteError' | 'huberLoss';

export type LossFn = LossRegressionFn;
export type Optimizer =
  | 'sgd'
  | 'adam'
  | 'rmsprop'
  | 'adagrad'
  | 'adadelta'
  | 'momentum';

export type ShowLegend = 'Yes' | 'No';

type GenericLayer = BasicLayer | HelpLayer;
type TrainingConfigEntity = GenericLayer | LossFn | Optimizer;
type ChartConfigEntity = ChartType | ShowLegend;
type GeneralConfigEntity = TrainingConfigEntity | ChartConfigEntity;

export type GeneralConfigSelectOption<T extends GeneralConfigEntity> = {
  value: T;
  viewValue: string;
};
