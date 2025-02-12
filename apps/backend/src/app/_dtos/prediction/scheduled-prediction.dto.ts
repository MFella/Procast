import { IsNotEmpty, IsString } from 'class-validator';
import { ComputationStatus } from '../../_typings/prediction/prediction.typings';

export class ScheduledPredictionDTO {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  status: ComputationStatus = 'pended';
}
