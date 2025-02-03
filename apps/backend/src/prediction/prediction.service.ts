import { Injectable } from '@nestjs/common';
import {
  OutputPrediction,
  PredictionSequence,
} from '../_typings/prediction/prediction.typings';
import * as tf from '@tensorflow/tfjs-node';
import { TrainingConfig } from '../_typings/prediction/training.typings';
import { GeneratedPredictionDTO } from '../_dtos/prediction/generated-prediction.dto';
import { CacheModelUtil } from './cache-model.util';

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

  async startPrediction(
    predictionData: Array<number>,
    trainingConfig: TrainingConfig
  ): Promise<GeneratedPredictionDTO> {
    return await this.generatePrediction(predictionData, trainingConfig);
  }

  private async generatePrediction(
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

    let { optimizer, learningRate, lossFn, basicLayer, helpLayer } =
      trainingConfig;
    optimizer ??= PredictionService.DEFAULT_TRAINING_CONFIG.optimizer;
    learningRate ??= PredictionService.DEFAULT_TRAINING_CONFIG.learningRate;
    lossFn ??= PredictionService.DEFAULT_TRAINING_CONFIG.lossFn;
    helpLayer ??= PredictionService.DEFAULT_TRAINING_CONFIG.helpLayer;
    basicLayer ??= PredictionService.DEFAULT_TRAINING_CONFIG.basicLayer;

    // Define a model for linear regression
    const model = await CacheModelUtil.resolveModel({
      optimizer,
      learningRate,
      lossFn,
      helpLayer,
      basicLayer,
    });

    const { inputTensor, outputTensor } = this.createPredictionSequences(
      pastData,
      sequenceLength
    );

    // Train the model using the data.
    await model.fit(inputTensor, outputTensor, {
      epochs: epochSize,
      batchSize: batchSize,
      verbose: 0,
      callbacks: {
        onTrainEnd: () => {},
        onEpochBegin: (epoch: number) => {
          const progressValue = Math.floor(
            (epoch / (epochSize * batchSize)) * 100
          );
          if (progressValue % 10 === 0) {
          }
        },
      },
    });

    const lastDataFromPast = pastData
      .slice(-sequenceLength)
      .map((value) => [value]);
    const lastDataFromPastTensor = tf.tensor3d([lastDataFromPast]);

    const prediction = model.predict(lastDataFromPastTensor) as tf.Tensor;
    return {
      result: Object.values(
        prediction.dataSync()
      ) as unknown as typeof PredictionService.DEFAULT_DATA_OUTPUT,
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

    let inputSequence = [];
    const outputSequence = [];

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
