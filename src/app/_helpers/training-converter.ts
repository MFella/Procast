import type {
  BasicLayer,
  HelpLayer,
  TensorflowLayerFnMappings,
} from '../_typings/workspace/sidebar-config.typings';

export class TrainingConverter {
  static convertLayerToTensorFn<T extends keyof TensorflowLayerFnMappings>(
    layer: T
  ): TensorflowLayerFnMappings[T] {
    // TODO: get rid of this 'as any' - typescript give us 'never' - why?
    switch (layer) {
      case 'GRU':
        return 'gru' as any;
      case 'LSTM':
        return 'lstm' as any;
      case 'SimpleRNN' as any:
        return 'simpleRNN' as any;
      case 'Dropout':
        return 'dropout' as any;
      case 'BatchNormalization':
        return 'batchNormalization' as any;
      default:
        throw new Error('Cannot recognize this type of layer: ', layer as any);
    }
  }
}
