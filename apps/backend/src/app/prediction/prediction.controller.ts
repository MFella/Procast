import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictionDataDTO } from '../_dtos/prediction/prediction-data.dto';
import { GeneratedPredictionDTO } from '../_dtos/prediction/generated-prediction.dto';
import { AvailableCachedTrainingOptionsDTO } from '../_dtos/training/available-cached-training-options.dto';
import { CacheModelUtil } from './cache-model.util';
import {
  filter,
  firstValueFrom,
  forkJoin,
  fromEvent,
  take,
  takeUntil,
} from 'rxjs';
import { ComputeInteractUtil } from '../util/compute-interact.util';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Post()
  async startPrediction(
    @Res() response,
    @Body() predictionDataDTO: PredictionDataDTO
  ): Promise<GeneratedPredictionDTO> {
    return await this.predictionService.generatePrediction(
      predictionDataDTO.data,
      predictionDataDTO.trainingConfig
    );
  }

  @Get('cached-train-config')
  async getCachedTrainConfigOptions(): Promise<AvailableCachedTrainingOptionsDTO> {
    return CacheModelUtil.getCachedTrainConfigOptions();
  }
}
