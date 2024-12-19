import { ChartType } from 'chart.js';
import {
  BasicLayer,
  HelpLayer,
  LossFn,
  Optimizer,
  PreferredExtension,
  ShowLegend,
} from '../workspace/sidebar-config.typings';

export type LocalStorageMappings = {
  basicLayer: BasicLayer;
  helpLayer: HelpLayer;
  lossFn: LossFn;
  optimizer: Optimizer;
  showLegend: boolean;
  learningRate: number;
  chartType: ChartType;
  preferredExtension: PreferredExtension;
};
