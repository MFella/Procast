import { ChartType } from 'chart.js';
import {
  BasicLayer,
  GeneralConfigSelectOption,
  HelpLayer,
  LossFn,
  Optimizer,
  PreferredExtension,
  ShowLegend,
} from '../_typings/workspace/sidebar-config.typings';

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

const lossFnOptions: Array<GeneralConfigSelectOption<LossFn>> = [
  {
    value: 'meanSquaredError',
    viewValue: 'Mean Squared Error',
  },
  {
    value: 'meanAbsoluteError',
    viewValue: 'Mean Absolute Error',
  },
  {
    value: 'huberLoss',
    viewValue: 'Huber Loss',
  },
];

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

export {
  preferredExtensionOptions,
  showLegendOptions,
  chartTypeOptions,
  basicLayerOptions,
  helpLayerOptions,
  optimizerOptions,
  lossFnOptions,
};
