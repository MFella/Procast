import { Rank, Tensor } from '@tensorflow/tfjs';

export type PredictionSequence = {
  inputTensor: Tensor<Rank.R3>;
  outputTensor: Tensor<Rank.R2>;
};
