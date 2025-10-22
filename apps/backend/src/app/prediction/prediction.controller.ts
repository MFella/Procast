import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictionDataDTO } from '../_dtos/prediction/prediction-data.dto';
import { ScheduledPredictionDTO } from '../_dtos/prediction/scheduled-prediction.dto';
import { AvailableCachedTrainingOptionsDTO } from '../_dtos/training/available-cached-training-options.dto';
import { CacheModelUtil } from './cache-model.util';
import { StopPredictionDTO } from '../_dtos/prediction/stop-prediction.dto';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Post()
  async startPrediction(
    @Body() predictionDataDTO: PredictionDataDTO
  ): Promise<ScheduledPredictionDTO> {
    return await this.predictionService.generatePrediction(
      predictionDataDTO.data,
      predictionDataDTO.trainingConfig
    );
  }

  @Delete('stop/:jobId')
  async stopPrediction(
    @Param('jobId') jobId: string
  ): Promise<StopPredictionDTO> {
    await this.predictionService.stopPrediction(jobId);
    return {};
  }

  @Get('cached-train-config')
  async getCachedTrainConfigOptions(): Promise<AvailableCachedTrainingOptionsDTO> {
    return CacheModelUtil.getCachedTrainConfigOptions();
  }

  @Get('cached/:id')
  async getCachedPredictionData(
    @Param('jobId') jobId: string
  ): Promise<Array<number>> {
    return await this.predictionService.getCachedPredictionData(jobId);
  }
}
