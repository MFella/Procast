import { IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingConfigDTO } from './training-config.dto';

const DATA_MIN_SIZE = 10;

export class PredictionDataDTO {
  @IsNotEmpty()
  @IsArray({ message: 'Provided data is not an array' })
  @ArrayMinSize(DATA_MIN_SIZE, {
    message: `Minimum size of data is ${DATA_MIN_SIZE}`,
  })
  @Type(() => Number)
  data: Array<number>;

  @IsNotEmpty()
  @Type(() => TrainingConfigDTO)
  trainingConfig: TrainingConfigDTO;
}
