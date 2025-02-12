import { ComputationStatus } from '../../_typings/prediction/prediction.typings';

export type ScheduledPredictionDTO = {
  jobId: string;
  status: ComputationStatus;
};
