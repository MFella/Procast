import { IsNotEmpty, IsString } from 'class-validator';

export class ScheduledPredictionDTO {
  @IsString()
  @IsNotEmpty()
  jobId: string;
}
