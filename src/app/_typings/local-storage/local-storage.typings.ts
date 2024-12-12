import {
  BasicLayer,
  HelpLayer,
  LossFn,
  Optimizer,
} from '../workspace/sidebar-config.typings';

export type LocalStorageMappings = {
  basicLayer: BasicLayer;
  helpLayer: HelpLayer;
  lossFn: LossFn;
  optimizer: Optimizer;
};
