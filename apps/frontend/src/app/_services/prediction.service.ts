import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrainingConfig } from '../_typings/workspace/sidebar-config.typings';
import { environment } from '../../environments/environment.development';
import { GeneratedPredictionDTO } from '../_dtos/prediction/generated-prediction.dto';
import { TrainingConverter } from '../_helpers/training-converter';

@Injectable({
  providedIn: 'root',
})
export class PredictionService {
  constructor(private readonly httpClient: HttpClient) {}

  startPrediction(
    data: Array<number>,
    trainingConfig: TrainingConfig
  ): Observable<GeneratedPredictionDTO> {
    return this.httpClient.post<GeneratedPredictionDTO>(
      `${this.getBackendUrl()}/prediction`,
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

  private getBackendUrl(): string {
    return `${environment.backend_url}api`;
  }
}
