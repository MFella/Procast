import { FormControl } from '@angular/forms';
import { ChartType } from 'chart.js';
import { losses } from '@tensorflow/tfjs';

export type HelpLayer = 'Dropout' | 'BatchNormalization';
export type BasicLayer = 'LSTM' | 'GRU' | 'SimpleRNN';
export type TensorflowLayerFnMappings = {
  ['LSTM']: 'lstm';
  ['GRU']: 'gru';
  ['SimpleRNN']: 'simpleRNN';
  ['Dropout']: 'dropout';
  ['BatchNormalization']: 'batchNormalization';
};

type LossRegressionFn = Exclude<keyof typeof losses, 'cosineDistance'>;

export type LossFn = LossRegressionFn;
export type Optimizer =
  | 'sgd'
  | 'adam'
  | 'rmsprop'
  | 'adagrad'
  | 'adadelta'
  | 'momentum';

export type ShowLegend = 'Yes' | 'No';

export type PreferredExtension = 'csv' | 'xlsx';

type GenericLayer = BasicLayer | HelpLayer;
type TrainingConfigEntity = GenericLayer | LossFn | Optimizer;
type ChartConfigEntity = ChartType | ShowLegend;
type FileSaveConfig = PreferredExtension;
type GeneralConfigEntity =
  | TrainingConfigEntity
  | ChartConfigEntity
  | FileSaveConfig;

export type GeneralConfigSelectOption<T extends GeneralConfigEntity> = {
  value: T;
  viewValue: string;
};

export type GenericFormGroup<T> = {
  [Key in keyof T]: FormControl<T[Key] | null>;
};

export type TrainingConfig = {
  basicLayer: BasicLayer;
  helpLayer: HelpLayer;
  lossFn: LossFn;
  optimizer: Optimizer;
  learningRate?: number;
};

export type ChartConfig = {
  chartType: ChartType;
  showLegend: boolean;
};

export type FileSave = {
  preferredExtension: PreferredExtension;
};

type SidebarGroupedConfig = {
  chartConfig: ChartConfig;
  fileSave: FileSave;
  trainingConfig: TrainingConfig;
};

export type SidebarConfig = {
  [Key in keyof SidebarGroupedConfig]: SidebarGroupedConfig[Key];
};

export type SidebarConfigChangeEvent<T extends keyof SidebarGroupedConfig> = {
  configType: T;
  config: SidebarGroupedConfig[T];
};
