import path from 'path';
import {
  BasicLayer,
  HelpLayer,
  LossFn,
  Optimizer,
  TrainingConfig,
} from '../_typings/prediction/training.typings';
import {
  Sequential,
  sequential,
  layers,
  losses,
  train,
  loadLayersModel,
  LayersModel,
} from '@tensorflow/tfjs-node';
import fs from 'fs';
import { AvailableCachedTrainingOptionsDTO } from '../_dtos/training/available-cached-training-options.dto';

export class CacheModelUtil {
  private static readonly TF_FILE_DESTINATION_PREFIX = 'file://';
  private static readonly CACHED_MODEL_FILES_DESTINATION = path.join(
    __dirname,
    'assets/models/'
  );
  private static readonly DEFAULT_INPUT_SHAPE: [number, number] = [21, 1];
  private static readonly DEFAULT_MOMENTUM_VALUE = 20;
  private static readonly DEFAULT_BASIC_LAYER_UNITS = 50;
  private static readonly DEFAULT_HELP_LAYER_RATE = 0.2;
  private static readonly DEFAULT_OUTPUT_LENGTH = 2;
  private static readonly CACHE_MODEL_STATIC_FILE_NAME = 'model.json';

  private static readonly CACHED_BASIC_LAYERS: Set<BasicLayer> =
    new Set<BasicLayer>(['lstm', 'gru', 'simpleRNN']);
  private static readonly CACHED_HELP_LAYERS: Set<HelpLayer> =
    new Set<HelpLayer>(['batchNormalization', 'dropout']);
  private static readonly CACHED_LOSS_FN: Set<LossFn> = new Set<LossFn>([
    'logLoss',
    // 'hingeLoss',
    // 'huberLoss',
    // 'meanSquaredError',
  ]);
  private static readonly CACHED_OPTIMIZER: Set<Optimizer> = new Set<Optimizer>(
    ['sgd', 'rmsprop', 'adam']
  );

  private static readonly CACHED_LEARNING_RATE: Set<number> = new Set<number>([
    1,
  ]);

  static async resolveModel(
    trainingConfig: TrainingConfig
  ): Promise<LayersModel> {
    const model = await CacheModelUtil.getCachedModel(trainingConfig);

    if (model) {
      return model;
    }

    return await CacheModelUtil.cacheSingleModel(trainingConfig);
  }

  static async createAndCacheTfModels(): Promise<void> {
    if (CacheModelUtil.hasCachedModels()) {
      return;
    }

    for (const basicLayer of CacheModelUtil.CACHED_BASIC_LAYERS) {
      for (const helpLayer of CacheModelUtil.CACHED_HELP_LAYERS) {
        for (const lossFn of CacheModelUtil.CACHED_LOSS_FN) {
          for (const optimizer of CacheModelUtil.CACHED_OPTIMIZER) {
            for (const learningRate of CacheModelUtil.CACHED_LEARNING_RATE) {
              await CacheModelUtil.cacheSingleModel({
                basicLayer,
                helpLayer,
                lossFn,
                optimizer,
                learningRate,
              } satisfies TrainingConfig);
            }
          }
        }
      }
    }
  }

  static async getCachedTrainConfigOptions(): Promise<AvailableCachedTrainingOptionsDTO> {
    return {
      basicLayer: Array.from(CacheModelUtil.CACHED_BASIC_LAYERS),
      helpLayer: Array.from(CacheModelUtil.CACHED_HELP_LAYERS),
      lossFn: Array.from(CacheModelUtil.CACHED_LOSS_FN),
      optimizer: Array.from(CacheModelUtil.CACHED_OPTIMIZER),
      learningRate: Array.from(CacheModelUtil.CACHED_LEARNING_RATE),
    };
  }

  private static async cacheSingleModel(
    trainingConfig: TrainingConfig
  ): Promise<LayersModel> {
    const model = CacheModelUtil.createSequentialCompiledModel(trainingConfig);
    const filePath = CacheModelUtil.getCachedModelFilePath(trainingConfig);

    await model.save(filePath);
    return model;
  }

  private static async getCachedModel(
    trainingConfig: TrainingConfig
  ): Promise<LayersModel> {
    const filePath = `${CacheModelUtil.getCachedModelFilePath(
      trainingConfig
    )}/${CacheModelUtil.CACHE_MODEL_STATIC_FILE_NAME}`;

    if (
      !fs.existsSync(
        filePath.split(CacheModelUtil.TF_FILE_DESTINATION_PREFIX).at(-1)
      )
    ) {
      return;
    }
    const sequentialModel = await loadLayersModel(filePath);

    sequentialModel.compile({
      loss: losses[trainingConfig.lossFn],
      optimizer:
        trainingConfig.optimizer === 'momentum'
          ? train.momentum(
              trainingConfig.learningRate,
              CacheModelUtil.DEFAULT_MOMENTUM_VALUE
            )
          : train[trainingConfig.optimizer](trainingConfig.learningRate),
    });
    return sequentialModel;
  }

  private static createSequentialCompiledModel(
    trainingConfig: TrainingConfig,
    inputShape: [number, number] = CacheModelUtil.DEFAULT_INPUT_SHAPE,
    basicLayerUnits: number = CacheModelUtil.DEFAULT_BASIC_LAYER_UNITS,
    returnSequences: boolean = false,
    helpLayerRate: number = CacheModelUtil.DEFAULT_HELP_LAYER_RATE,
    outputLength: number = CacheModelUtil.DEFAULT_OUTPUT_LENGTH
  ): Sequential {
    const sequentialModel: Sequential = sequential();

    sequentialModel.add(
      layers[trainingConfig.basicLayer]({
        units: basicLayerUnits,
        inputShape,
        returnSequences,
      })
    );

    sequentialModel.add(
      layers[trainingConfig.helpLayer]({
        rate: helpLayerRate,
      })
    );

    sequentialModel.add(
      layers.dense({
        units: outputLength,
      })
    );

    sequentialModel.compile({
      loss: losses[trainingConfig.lossFn],
      optimizer:
        trainingConfig.optimizer === 'momentum'
          ? train.momentum(
              trainingConfig.learningRate,
              CacheModelUtil.DEFAULT_MOMENTUM_VALUE
            )
          : train[trainingConfig.optimizer](trainingConfig.learningRate),
    });

    return sequentialModel;
  }

  private static getCachedModelFilePath(
    trainingConfig: TrainingConfig
  ): string {
    return (
      `${CacheModelUtil.TF_FILE_DESTINATION_PREFIX}${CacheModelUtil.CACHED_MODEL_FILES_DESTINATION}` +
      Object.keys(trainingConfig)
        .sort()
        .map((key) => trainingConfig[key])
        .join('_')
    );
  }

  private static hasCachedModels(): boolean {
    const filenamesFromCacheDestination = fs.readdirSync(
      CacheModelUtil.CACHED_MODEL_FILES_DESTINATION
    );
    return (
      filenamesFromCacheDestination.length >=
      CacheModelUtil.CACHED_BASIC_LAYERS.size *
        CacheModelUtil.CACHED_HELP_LAYERS.size *
        CacheModelUtil.CACHED_LOSS_FN.size *
        CacheModelUtil.CACHED_LEARNING_RATE.size *
        CacheModelUtil.CACHED_OPTIMIZER.size
    );
  }
}
