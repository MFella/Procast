/// <reference lib="webworker" />

import { TypeHelper } from '../_helpers/type-helper';
import { Predictor } from '../_helpers/predictor';

addEventListener('message', async ({ data }) => {
  try {
    if (!('worksheetData' in data) || !('trainingConfig' in data)) {
      postMessage({
        event: 'fail',
        message:
          'At least one of field is not provided: worksheetData/trainingConfig',
      });
      return;
    }

    const generatedPrediction = await Predictor.generatePrediction(
      data.worksheetData,
      data.trainingConfig,
      postMessage
    );
    postMessage({ event: 'success', prediction: generatedPrediction });
  } catch (error: unknown) {
    if (TypeHelper.isUnknownAnObject(error, 'message')) {
      postMessage({ event: 'fail', message: error.message });
    }
  }
});
