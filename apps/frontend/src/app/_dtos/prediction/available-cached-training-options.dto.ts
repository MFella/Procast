import { TrainingConfig } from '../../_typings/workspace/sidebar-config.typings';

export type AvailableCachedTrainingOptionsDTO = {
  [Key in keyof TrainingConfig]: Array<TrainingConfig[Key]>;
};
