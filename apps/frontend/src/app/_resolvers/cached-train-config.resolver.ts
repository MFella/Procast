import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PredictionService } from '../_services/prediction.service';
import { AvailableCachedTrainingOptionsDTO } from '../_dtos/prediction/available-cached-training-options.dto';

export const cachedTrainConfigResolver: ResolveFn<
  AvailableCachedTrainingOptionsDTO
> = () => {
  return inject(PredictionService).getCachedPredictionConfig();
};
