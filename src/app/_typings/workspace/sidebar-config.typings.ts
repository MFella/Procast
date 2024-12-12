export type HelpLayer = 'Dropout' | 'BatchNormalization';
export type BasicLayer = 'LSTM' | 'GRU' | 'SimpleRNN';

type LossRegressionFn = 'meanSquaredError' | 'meanAbsoluteError' | 'huberLoss';

export type LossFn = LossRegressionFn;
export type Optimizer =
  | 'sgd'
  | 'adam'
  | 'rmsprop'
  | 'adagrad'
  | 'adadelta'
  | 'momentum';

type GenericLayer = BasicLayer | HelpLayer;
type PredictConfigEntity = GenericLayer | LossFn | Optimizer;

export type PredictConfigSelectOption<T extends PredictConfigEntity> = {
  value: T;
  viewValue: string;
};
