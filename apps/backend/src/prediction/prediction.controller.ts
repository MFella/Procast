import { Body, Controller, Post } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictionDataDTO } from '../_dtos/prediction/prediction-data.dto';
import { GeneratedPredictionDTO } from '../_dtos/prediction/generated-prediction.dto';

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
}
