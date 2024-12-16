import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  Renderer2,
  viewChild,
} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { Chart, ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { WorksheetComponent } from '../worksheet/worksheet.component';
import { MatDialog } from '@angular/material/dialog';
import { LoadDataComponent } from '../load-data/load-data.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  BasicLayer,
  HelpLayer,
  LossFn,
  Optimizer,
  GeneralConfigSelectOption,
  ShowLegend,
} from '../_typings/workspace/sidebar-config.typings';
import { LocalStorageService } from '../local-storage.service';
import { LocalStorageMappings } from '../_typings/local-storage/local-storage.typings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { WorksheetRowData } from '../_typings/worksheet.typings';
import { TrainingConverter } from '../_helpers/training-converter';
import { PredictionSequence } from '../_typings/prediction/prediction.typings';

type TrainingConfigFormGroup = {
  basicLayer: FormControl<BasicLayer | null>;
  helpLayer: FormControl<HelpLayer | null>;
  lossFn: FormControl<LossFn | null>;
  optimizer: FormControl<Optimizer | null>;
  learningRate?: FormControl<number | null>;
};

type ChartConfigFormGroup = {
  chartType: FormControl<ChartType | null>;
  showLegend: FormControl<boolean | null>;
};

@Component({
  selector: 'app-workspace',
  imports: [
    BaseChartDirective,
    WorksheetComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgClass,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent implements OnInit {
  private chartComponent = viewChild.required(BaseChartDirective);

  private static readonly MOMENTUM_DEFAULT = 20;
  private static readonly LEARNING_RATE_DEFAULT = 0.001;
  private static readonly OPTIMIZER_DEFAULT: Optimizer = 'momentum';
  private static readonly LOSS_FN_DEFAULT: LossFn = 'meanSquaredError';
  private static readonly BASIC_LAYER_DEFAULT: BasicLayer = 'LSTM';
  private static readonly HELP_LAYER_DEFAULT: HelpLayer = 'Dropout';

  private readonly localStorageService = inject(LocalStorageService);
  private readonly matDialog = inject(MatDialog);
  private readonly renderer2 = inject(Renderer2);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  #destroyRef = inject(DestroyRef);
  private loadedData: Array<any> = [];
  worksheetData: Array<WorksheetRowData> = [];
  isPredictionInProgress = false;

  traningConfigFormGroup = new FormGroup<TrainingConfigFormGroup>({
    basicLayer: new FormControl('GRU', [Validators.required]),
    helpLayer: new FormControl('Dropout', [Validators.required]),
    lossFn: new FormControl('meanSquaredError', [Validators.required]),
    optimizer: new FormControl('momentum', [Validators.required]),
    learningRate: new FormControl(0.001, []),
  });

  chartConfigFormGroup = new FormGroup<ChartConfigFormGroup>({
    showLegend: new FormControl(false, [Validators.required]),
    chartType: new FormControl('line', [Validators.required]),
  });

  isExpanded = false;
  excludedOptimizersFromLearningRate: Array<Optimizer> = ['adadelta', 'adam'];
  canStartPrediction = false;
  canSaveResults = false;

  basicLayerOptions: Array<GeneralConfigSelectOption<BasicLayer>> = [
    {
      value: 'GRU',
      viewValue: 'GRU',
    },
    {
      value: 'LSTM',
      viewValue: 'LSTM',
    },
    {
      value: 'SimpleRNN',
      viewValue: 'Simple RNN',
    },
  ];

  helpLayerOptions: Array<GeneralConfigSelectOption<HelpLayer>> = [
    {
      value: 'Dropout',
      viewValue: 'Dropout',
    },
    {
      value: 'BatchNormalization',
      viewValue: 'Batch Normalization',
    },
  ];

  lossFnOptions: Array<GeneralConfigSelectOption<LossFn>> = [
    {
      value: 'meanSquaredError',
      viewValue: 'Mean Squared Error',
    },
    {
      value: 'meanAbsoluteError',
      viewValue: 'Mean Absolute Error',
    },
    {
      value: 'huberLoss',
      viewValue: 'Huber Loss',
    },
  ];

  optimizerOptions: Array<GeneralConfigSelectOption<Optimizer>> = [
    {
      value: 'sgd',
      viewValue: 'Stochastic Gradient Descent',
    },
    {
      value: 'adam',
      viewValue: 'Adaptive Moment Estimation',
    },
    {
      value: 'rmsprop',
      viewValue: 'Root Mean Square Propagation',
    },
    {
      value: 'adagrad',
      viewValue: 'Adaptive Gradient Algorithm',
    },
    {
      value: 'adadelta',
      viewValue: 'AdaDelta',
    },
    {
      value: 'momentum',
      viewValue: 'Momentum',
    },
  ];

  chartTypeOptions: Array<GeneralConfigSelectOption<ChartType>> = [
    {
      value: 'bar',
      viewValue: 'Bar',
    },
    {
      value: 'line',
      viewValue: 'Line',
    },
    {
      value: 'pie',
      viewValue: 'Pie',
    },
    {
      value: 'radar',
      viewValue: 'Radar',
    },
    {
      value: 'scatter',
      viewValue: 'Scatter',
    },
  ];

  showLegendOptions: Array<GeneralConfigSelectOption<ShowLegend>> = [
    {
      value: 'Yes',
      viewValue: 'Yes',
    },
    {
      value: 'No',
      viewValue: 'No',
    },
  ];

  private skipped = (ctx: any, value: any) =>
    ctx.p0.skip || ctx.p1.skip ? value : undefined;
  private down = (ctx: any, value: any) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        data: [65, 59, NaN, 81, 56, NaN, 72],
        label: 'Series A',
        fill: true,
        tension: 0.5,
        borderColor: 'blue',
        segment: {
          // borderColor: (ctx) =>
          //   this.skipped(ctx, 'rgb(0,0,0,0.2)') ||
          //   this.down(ctx, 'rgb(192,75,75)'),
          borderDash: (ctx: any) => this.skipped(ctx, [6, 6]),
        },
        spanGaps: true,
        backgroundColor: 'rgba(224, 242, 254, .6)',
      },
    ],
  };

  lineChartOptions: ChartOptions<ChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    // aspectRatio: 1,
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 1,
        to: 0,
        loop: true,
      },
    },
  };

  lineChartLegend = true;

  ngOnInit(): void {
    this.loadConfigsFromLocalStorage();
    this.observeTrainingConfigChanged();
    this.observeChartConfigChanged();
  }

  openLoadDataModal(): void {
    this.matDialog.open(LoadDataComponent, {
      width: '500px',
      enterAnimationDuration: 200,
      exitAnimationDuration: 300,
    });
  }

  async generatePrediction(
    sequenceLength: number = 12,
    outputLength: number = 2
  ): Promise<void> {
    const pastData = this.worksheetData.map((data) => data.value);
    let { optimizer, learningRate, lossFn, basicLayer, helpLayer } =
      this.traningConfigFormGroup.value;
    optimizer ??= WorkspaceComponent.OPTIMIZER_DEFAULT;
    learningRate ??= WorkspaceComponent.LEARNING_RATE_DEFAULT;
    lossFn ??= WorkspaceComponent.LOSS_FN_DEFAULT;
    helpLayer ??= WorkspaceComponent.HELP_LAYER_DEFAULT;
    basicLayer ??= WorkspaceComponent.BASIC_LAYER_DEFAULT;

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
    // model.compile({
    //   loss: lossFn,
    //   optimizer:
    //     optimizer === 'momentum'
    //       ? tf.train.momentum(learningRate, WorkspaceComponent.MOMENTUM_DEFAULT)
    //       : tf.train[optimizer](learningRate),
    // });

    // const { inputTensor, outputTensor } = this.createPredictionSequences(
    //   pastData,
    //   sequenceLength
    // );

    // Train the model using the data.

    // await model.fit(inputTensor, outputTensor, {
    //   epochs: 100,
    //   batchSize: 1,
    // });

    // const lastDataFromPast = pastData
    //   .slice(-sequenceLength)
    //   .map((value) => [value]);
    // const lastDataFromPastTensor = tf.tensor3d([lastDataFromPast]);

    // const prediction = model.predict(lastDataFromPastTensor) as tf.Tensor;
    // const predictedData = prediction.dataSync();
    // console.log(
    //   `Next month: ${predictedData[0]}, another month: ${predictedData[1]}`
    // );
  }

  loadData(): void {
    /// To implement
  }

  async startQuickPrediction(): Promise<void> {
    this.generateRandomData();
    await this.generatePrediction();
  }

  private loadConfigsFromLocalStorage(): void {
    this.traningConfigFormGroup.setValue({
      basicLayer: this.localStorageService.getItem('basicLayer') ?? 'GRU',
      helpLayer: this.localStorageService.getItem('helpLayer') ?? 'Dropout',
      lossFn: this.localStorageService.getItem('lossFn') ?? 'meanSquaredError',
      optimizer: this.localStorageService.getItem('optimizer') ?? 'momentum',
      learningRate: this.localStorageService.getItem('learningRate') ?? 0.001,
    });

    this.chartConfigFormGroup.setValue({
      chartType: this.localStorageService.getItem('chartType') ?? 'line',
      showLegend: this.localStorageService.getItem('showLegend'),
    });

    this.saveTrainigConfigToLocalStorage();
  }

  private saveTrainigConfigToLocalStorage(): void {
    const configToSave = this.traningConfigFormGroup.value;
    this.localStorageService.setItems(
      new Map(
        Object.keys(configToSave).map((key) => [
          key as keyof LocalStorageMappings,
          (configToSave as any)[key],
        ])
      )
    );
  }

  private observeTrainingConfigChanged(): void {
    this.traningConfigFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((formGroupValue) => {
        this.saveConfigToLocalStorage(formGroupValue);
        const learningRateFormControl =
          this.traningConfigFormGroup.controls.learningRate;

        if (formGroupValue.optimizer && learningRateFormControl) {
          const shouldDisableLearningRate =
            this.excludedOptimizersFromLearningRate.includes(
              formGroupValue.optimizer
            );

          shouldDisableLearningRate && learningRateFormControl.disable();
        }
      });
  }

  private observeChartConfigChanged(): void {
    this.chartConfigFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((formGroupValue) => {
        this.saveConfigToLocalStorage(formGroupValue);
      });
  }

  private saveConfigToLocalStorage<
    T extends keyof LocalStorageMappings
  >(formGroupValue: { [Key in T]?: LocalStorageMappings[Key] | null }): void {
    const formValueMap = new Map<
      keyof LocalStorageMappings,
      LocalStorageMappings[keyof LocalStorageMappings]
    >();
    Object.entries(formGroupValue).forEach(([key, value]) =>
      formValueMap.set(
        key as keyof LocalStorageMappings,
        value as LocalStorageMappings[keyof LocalStorageMappings]
      )
    );
    this.localStorageService.setItems(formValueMap);
  }

  private fetchWorksheetData(): void {
    // some kind of raw data
    this.loadedData = [];

    // here, we should convert loadedData to worksheetData
    // and make sure, that those are in right format
    this.generateRandomData();
  }

  private generateRandomData(): void {
    this.worksheetData = Array.from({ length: 24 }, (_, i) => {
      const utcFullYear = new Date().getUTCFullYear() - (i < 12 ? 1 : 0);
      return {
        label:
          new Date(0, i).toLocaleString('en-US', { month: '2-digit' }) +
          ' / ' +
          utcFullYear,
        value: Math.ceil((Math.random() + 10) * 50),
      };
    });

    this.chartData.labels = this.worksheetData.map(
      (worksheetRowData) => worksheetRowData.label
    );
    this.chartData.datasets[0].data = this.worksheetData.map(
      (worksheetRowData) => worksheetRowData.value
    );
    this.chartComponent().update();
    this.changeDetectorRef.detectChanges();
  }

  private createPredictionSequences(
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
    // let inputTensor = tf.tensor3d(inputSequence, [
    //   inputSequence.length,
    //   inputLength,
    //   1,
    // ]);

    // inputTensor = inputTensor.reshape([
    //   inputTensor.shape[0],
    //   inputTensor.shape[1],
    //   1,
    // ]);

    return {
      inputTensor: tf.tensor3d(inputSequence),
      outputTensor: tf.tensor2d(outputSequence),
    };
  }
}
