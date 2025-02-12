import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainingConfig } from '../_typings/workspace/sidebar-config.typings';
import { environment } from '../../environments/environment.development';
import { ScheduledPredictionDTO } from '../_dtos/prediction/generated-prediction.dto';
import { TrainingConverter } from '../_helpers/training-converter';
import { AvailableCachedTrainingOptionsDTO } from '../_dtos/prediction/available-cached-training-options.dto';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  constructor(private readonly httpClient: HttpClient) {}

  schedulePrediction(
    data: Array<number>,
    trainingConfig: TrainingConfig
  ): Observable<ScheduledPredictionDTO> {
    return this.httpClient.post<ScheduledPredictionDTO>(
      `${this.getBackendUrl()}`,
      {
        data,
        trainingConfig: {
          ...trainingConfig,
          basicLayer: TrainingConverter.convertLayerToTensorFn(
            trainingConfig.basicLayer
          ),
          helpLayer: TrainingConverter.convertLayerToTensorFn(
            trainingConfig.helpLayer
          ),
        },
      }
    );
  }

  getPredictionData(predictionJobId: string): Observable<Array<number>> {
    return this.httpClient.get<Array<number>>(
      `${this.getBackendUrl()}/cached/${predictionJobId}`
    );
  }

  getCachedPredictionConfig(): Observable<AvailableCachedTrainingOptionsDTO> {
    return this.httpClient.get<AvailableCachedTrainingOptionsDTO>(
      `${this.getBackendUrl()}/cached-train-config`
    );
  }

  private getBackendUrl(): string {
    return `${environment.backend_url}/prediction`;
  }
}
