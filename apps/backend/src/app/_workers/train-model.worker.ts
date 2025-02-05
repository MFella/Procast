import { CacheModelUtil } from '../prediction/cache-model.util';
import { ComputeInteractUtil } from '../util/compute-interact.util';
import { tensor3d } from '@tensorflow/tfjs';
import {
  WorkerMessage,
  type OutputPrediction,
} from '../_typings/prediction/prediction.typings';
import { resolve } from 'path';
import { WorkerMessageFitPayload } from '../_typings/prediction/training.typings';

export const filename = resolve(__filename);

export default async function trainModel(
  workerMessageFitPayload: WorkerMessageFitPayload,
  jobProgressCb: (...args: Array<any>) => void
): Promise<OutputPrediction> {
  const {
    trainingConfig: { optimizer, learningRate, lossFn, helpLayer, basicLayer },
    inputTensor,
    outputTensor,
    epochs,
    batchSize,
    lastDataFromPast,
  } = workerMessageFitPayload;

  // Define a model for linear regression
  const model = await CacheModelUtil.resolveModel({
    optimizer,
    learningRate,
    lossFn,
    helpLayer,
    basicLayer,
  });
  ComputeInteractUtil.COMPUTATION_STATUS$.next('compiled');

  // Train the model using the data.
  ComputeInteractUtil.COMPUTATION_STATUS$.next('training');

  await model.fit(inputTensor, outputTensor, {
    epochs,
    batchSize,
    // verbose: 0,
    callbacks: {
      onEpochBegin: (epoch) => {
        const progressValue = Math.floor((epoch / (epochs * batchSize)) * 100);
        if (progressValue % 10 === 0) {
          jobProgressCb(progressValue);
        }
      },
    },
  });

  ComputeInteractUtil.COMPUTATION_STATUS$.next('trained');
  const lastDataFromPastTensor = tensor3d([lastDataFromPast]);

  const prediction = model.predict(lastDataFromPastTensor) as any;
  return Object.values(prediction.dataSync()) as OutputPrediction;
}
