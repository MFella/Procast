import { Body, Controller, Get, Post } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictionDataDTO } from '../_dtos/prediction/prediction-data.dto';
import { GeneratedPredictionDTO } from '../_dtos/prediction/generated-prediction.dto';
import { AvailableCachedTrainingOptionsDTO } from '../_dtos/training/available-cached-training-options.dto';
import { CacheModelUtil } from './cache-model.util';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Post()
  async startPrediction(
    @Body() predictionDataDTO: PredictionDataDTO
  ): Promise<GeneratedPredictionDTO> {
    return this.predictionService.startPrediction(
      predictionDataDTO.data,
      predictionDataDTO.trainingConfig
    );
  }

  @Get('cached-train-config')
  async getCachedTrainConfigOptions(): Promise<AvailableCachedTrainingOptionsDTO> {
    return CacheModelUtil.getCachedTrainConfigOptions();
  }
}
