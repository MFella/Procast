import { ChartType } from 'chart.js';
import {
  BasicLayer,
  GeneralConfigSelectOption,
  HelpLayer,
  LossFn,
  Optimizer,
  PreferredExtension,
  ShowLegend,
  TrainingConfig,
} from '../_typings/workspace/sidebar-config.typings';
import { losses } from '@tensorflow/tfjs';

const basicLayerOptions: Array<GeneralConfigSelectOption<BasicLayer>> = [
  {
    value: 'GRU',
    viewValue: 'GRU',
  },
  {
    value: 'LSTM',
    viewValue: 'LSTM',
  },
  {
    value: 'SimpleRNN',
    viewValue: 'Simple RNN',
  },
];

const helpLayerOptions: Array<GeneralConfigSelectOption<HelpLayer>> = [
  {
    value: 'Dropout',
    viewValue: 'Dropout',
  },
  {
    value: 'BatchNormalization',
    viewValue: 'Batch Normalization',
  },
];

const lossFnOptions: Array<GeneralConfigSelectOption<LossFn>> = Object.keys(
  losses
).map((loss) => ({
  value: loss as LossFn,
  viewValue:
    loss[0]?.toUpperCase() +
    loss.slice(1).replace(/([a-zA-Z])(?=[A-Z])/g, '$1 '),
}));

const optimizerOptions: Array<GeneralConfigSelectOption<Optimizer>> = [
  {
    value: 'sgd',
    viewValue: 'Stochastic Gradient Descent',
  },
  {
    value: 'adam',
    viewValue: 'Adaptive Moment Estimation',
  },
  {
    value: 'rmsprop',
    viewValue: 'Root Mean Square Propagation',
  },
  {
    value: 'adagrad',
    viewValue: 'Adaptive Gradient Algorithm',
  },
  {
    value: 'adadelta',
    viewValue: 'AdaDelta',
  },
  {
    value: 'momentum',
    viewValue: 'Momentum',
  },
];

const chartTypeOptions: Array<GeneralConfigSelectOption<ChartType>> = [
  {
    value: 'bar',
    viewValue: 'Bar',
  },
  {
    value: 'line',
    viewValue: 'Line',
  },
  {
    value: 'pie',
    viewValue: 'Pie',
  },
  {
    value: 'radar',
    viewValue: 'Radar',
  },
  {
    value: 'scatter',
    viewValue: 'Scatter',
  },
];

const showLegendOptions: Array<GeneralConfigSelectOption<ShowLegend>> = [
  {
    value: 'Yes',
    viewValue: 'Yes',
  },
  {
    value: 'No',
    viewValue: 'No',
  },
];

const preferredExtensionOptions: Array<
  GeneralConfigSelectOption<PreferredExtension>
> = [
  {
    value: 'csv',
    viewValue: 'CSV',
  },
  {
    value: 'xlsx',
    viewValue: 'XLSX',
  },
];

const trainingDefaultConfig: TrainingConfig = {
  basicLayer: 'LSTM',
  helpLayer: 'Dropout',
  learningRate: 20,
  lossFn: 'huberLoss',
  optimizer: 'rmsprop',
};

export {
  preferredExtensionOptions,
  showLegendOptions,
  chartTypeOptions,
  basicLayerOptions,
  helpLayerOptions,
  optimizerOptions,
  lossFnOptions,
  trainingDefaultConfig,
};
