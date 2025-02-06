import { Injectable } from '@nestjs/common';
import {
  type OutputPrediction,
  type PredictionSequence,
} from '../_typings/prediction/prediction.typings';
import * as tf from '@tensorflow/tfjs-node';
import type {
  TrainingConfig,
  WorkerMessageFitPayload,
} from '../_typings/prediction/training.typings';
import { GeneratedPredictionDTO } from '../_dtos/prediction/generated-prediction.dto';
import { ComputeInteractUtil } from '../util/compute-interact.util';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class PredictionService {
  private static readonly DEFAULT_TRAINING_CONFIG: TrainingConfig = {
    basicLayer: 'lstm',
    helpLayer: 'dropout',
    learningRate: 20,
    lossFn: 'huberLoss',
    optimizer: 'rmsprop',
  };

  private static readonly REQUIRED_DATA_LENGTH = 24;
  private static readonly DEFAULT_DATA_INPUT_LENGTH = 12;
  private static readonly DEFAULT_DATA_OUTPUT: OutputPrediction = [0, 0];

  constructor(
    @InjectQueue('trainModel')
    private trainModelQueue: Queue<WorkerMessageFitPayload>
  ) {}

  async generatePrediction(
    predictionData: Array<number>,
    trainingConfig: TrainingConfig
  ): Promise<GeneratedPredictionDTO> {
    const outputLength = 2;
    const sequenceLength =
      PredictionService.REQUIRED_DATA_LENGTH - outputLength - 1;
    const batchSize = 1;
    const epochSize = 100;

    const pastData = predictionData.slice(
      0,
      PredictionService.REQUIRED_DATA_LENGTH
    );
    if (pastData.length < PredictionService.REQUIRED_DATA_LENGTH) {
      pastData.unshift(
        ...Array(PredictionService.REQUIRED_DATA_LENGTH - pastData.length).fill(
          0
        )
      );
    }

    trainingConfig.optimizer ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.optimizer;
    trainingConfig.learningRate ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.learningRate;
    trainingConfig.lossFn ??= PredictionService.DEFAULT_TRAINING_CONFIG.lossFn;
    trainingConfig.helpLayer ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.helpLayer;
    trainingConfig.basicLayer ??=
      PredictionService.DEFAULT_TRAINING_CONFIG.basicLayer;

    const lastDataFromPast = pastData
      .slice(-sequenceLength)
      .map((value) => [value]);

    const { inputTensor, outputTensor } = this.createPredictionSequences(
      pastData,
      sequenceLength
    );

    const trainModelWorker = await this.trainModelQueue.add({
      trainingConfig,
      lastDataFromPast,
      inputTensor,
      outputTensor,
      batchSize,
      epochs: epochSize,
    });

    return {
      result: trainModelWorker.returnvalue,
    };
  }

  private createPredictionSequences(
    data: Array<number>,
    inputLength: number = PredictionService.DEFAULT_DATA_INPUT_LENGTH,
    outputLength: number = PredictionService.DEFAULT_DATA_OUTPUT.length
  ): PredictionSequence {
    if (data.length < inputLength + outputLength) {
      throw new Error(
        'Cannot make prediction - provided historical data is too short to train model'
      );
    }

    let inputSequence: any = [];
    const outputSequence: any = [];

    for (let i = 0; i < data.length - inputLength - outputLength; i++) {
      inputSequence.push(data.slice(i, i + inputLength));
      outputSequence.push(
        data.slice(i + inputLength, i + inputLength + outputLength)
      );
    }

    inputSequence = inputSequence.map((input) => input.map((value) => [value]));

    return {
      inputTensor: tf.tensor3d(inputSequence),
      outputTensor: tf.tensor2d(outputSequence),
    };
  }
}
