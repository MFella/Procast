import { IsDefined, IsOptional } from 'class-validator';
import {
  BasicLayer,
  HelpLayer,
  LossFn,
  Optimizer,
} from '../../_typings/prediction/training.typings';

const DEFAULT_LEARNING_RATE = 1;

export class TrainingConfigDTO {
  @IsDefined()
  basicLayer: BasicLayer;

  @IsDefined()
  helpLayer: HelpLayer;

  @IsDefined()
  lossFn: LossFn;

  @IsDefined()
  optimizer: Optimizer;

  @IsOptional()
  learningRate?: number = DEFAULT_LEARNING_RATE;
}
