import { TrainingConfigDTO } from '../prediction/training-config.dto';

export type AvailableCachedTrainingOptionsDTO = {
  [Key in keyof TrainingConfigDTO]: Array<TrainingConfigDTO[Key]>;
};
