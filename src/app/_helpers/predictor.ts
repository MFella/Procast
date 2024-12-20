import { WorksheetRowData } from '../_typings/worksheet.typings';
import {
  BasicLayer,
  HelpLayer,
  LossFn,
  Optimizer,
  TrainingConfig,
} from '../_typings/workspace/sidebar-config.typings';
import * as tf from '@tensorflow/tfjs';
import { TrainingConverter } from './training-converter';
import { PredictionSequence } from '../_typings/prediction/prediction.typings';

export class Predictor {
  private static readonly MOMENTUM_DEFAULT = 20;
  private static readonly LEARNING_RATE_DEFAULT = 0.001;
  private static readonly OPTIMIZER_DEFAULT: Optimizer = 'momentum';
  private static readonly LOSS_FN_DEFAULT: LossFn = 'meanSquaredError';
  private static readonly BASIC_LAYER_DEFAULT: BasicLayer = 'LSTM';
  private static readonly HELP_LAYER_DEFAULT: HelpLayer = 'Dropout';

  static async generatePrediction(
    worksheetData: Map<string, WorksheetRowData>,
    trainingConfig: TrainingConfig,
    postMessageFn: any
  ): Promise<Array<number>> {
    const outputLength = 2;
    const sequenceLength = worksheetData.size - outputLength - 1;
    const batchSize = 1;
    const epochSize = 100;

    const pastData = Array.from(worksheetData.values()).map(
      (data) => data.value
    );
    let { optimizer, learningRate, lossFn, basicLayer, helpLayer } =
      trainingConfig;
    optimizer ??= Predictor.OPTIMIZER_DEFAULT;
    learningRate ??= Predictor.LEARNING_RATE_DEFAULT;
    lossFn ??= Predictor.LOSS_FN_DEFAULT;
    helpLayer ??= Predictor.HELP_LAYER_DEFAULT;
    basicLayer ??= Predictor.BASIC_LAYER_DEFAULT;

    // Define a model for linear regression
    const model = tf.sequential();
    const basicLayerMethod =
      TrainingConverter.convertLayerToTensorFn<BasicLayer>(basicLayer);
    const helpLayerMethod =
      TrainingConverter.convertLayerToTensorFn<HelpLayer>(helpLayer);
    model.add(
      tf.layers[basicLayerMethod]({
        units: 50,
        inputShape: [sequenceLength, 1],
        returnSequences: false,
      })
    );

    model.add(
      tf.layers[helpLayerMethod]({
        rate: 0.2,
      })
    );

    // creation of output layer
    model.add(tf.layers.dense({ units: outputLength }));

    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({
      loss: lossFn,
      optimizer:
        optimizer === 'momentum'
          ? tf.train.momentum(learningRate, Predictor.MOMENTUM_DEFAULT)
          : tf.train[optimizer](learningRate),
    });

    const { inputTensor, outputTensor } = Predictor.createPredictionSequences(
      pastData,
      sequenceLength
    );

    // Train the model using the data.

    await model.fit(inputTensor, outputTensor, {
      epochs: epochSize,
      batchSize: batchSize,
      callbacks: {
        onTrainBegin: (logs?: tf.Logs) => {
          console.log(logs);
        },
        onTrainEnd: (logs?: tf.Logs) => {
          console.log(logs);
          postMessageFn({
            event: 'progress',
            value: 100,
          });
        },
        onEpochBegin: (epoch: number) => {
          console.log(epoch);
          const progressValue = Math.floor(
            (epoch / (epochSize * batchSize)) * 100
          );
          if (progressValue % 10 === 0) {
            postMessageFn({
              event: 'progress',
              value: Math.floor((epoch / (epochSize * batchSize)) * 100),
            });
          }
        },
      },
    });

    const lastDataFromPast = pastData
      .slice(-sequenceLength)
      .map((value) => [value]);
    const lastDataFromPastTensor = tf.tensor3d([lastDataFromPast]);

    const prediction = model.predict(lastDataFromPastTensor) as tf.Tensor;
    return prediction.dataSync() as unknown as Array<number>;
  }

  private static createPredictionSequences(
    data: Array<number>,
    inputLength: number = 12,
    outputLength: number = 2
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
