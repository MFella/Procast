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
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
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
  PreferredExtension,
} from '../_typings/workspace/sidebar-config.typings';
import { LocalStorageService } from '../local-storage.service';
import { LocalStorageMappings } from '../_typings/local-storage/local-storage.typings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { WorksheetRowData } from '../_typings/worksheet.typings';
import { TrainingConverter } from '../_helpers/training-converter';
import { PredictionSequence } from '../_typings/prediction/prediction.typings';
import { Store } from '@ngrx/store';
import { seriesDataActions } from '../architecture/actions/series-data.actions';
import { selectSeriesData } from '../architecture/selectors';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SudoRedoActionPayload } from '../_typings/workspace/actions/workspace-actions.typings';
import { FileInteractionService } from '../_services/file-interaction.service';

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

type FileSaveFormGroup = {
  preferredExtension: FormControl<PreferredExtension | null>;
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
    MatTooltipModule,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent implements OnInit {
  private chartComponent = viewChild.required(BaseChartDirective);

  private static readonly MINIMAL_SEQUENCE_LENGTH = 6;
  private static readonly UNDO_REDO_LENGTH_THRESHOLD = 20;
  private static readonly MOMENTUM_DEFAULT = 20;
  private static readonly LEARNING_RATE_DEFAULT = 0.001;
  private static readonly OPTIMIZER_DEFAULT: Optimizer = 'momentum';
  private static readonly LOSS_FN_DEFAULT: LossFn = 'meanSquaredError';
  private static readonly BASIC_LAYER_DEFAULT: BasicLayer = 'LSTM';
  private static readonly HELP_LAYER_DEFAULT: HelpLayer = 'Dropout';

  private readonly localStorageService = inject(LocalStorageService);
  private readonly matDialog = inject(MatDialog);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly store = inject(Store);
  private readonly fileInteractionService = inject(FileInteractionService);

  #destroyRef = inject(DestroyRef);
  private loadedData: Array<any> = [];
  worksheetData: Map<string, WorksheetRowData> = new Map<
    string,
    WorksheetRowData
  >();
  isPredictionInProgress = false;

  trainingConfigFormGroup = new FormGroup<TrainingConfigFormGroup>({
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

  fileSaveFormGroup = new FormGroup<FileSaveFormGroup>({
    preferredExtension: new FormControl('csv', [Validators.required]),
  });

  isExpanded = false;
  excludedOptimizersFromLearningRate: Array<Optimizer> = ['adadelta', 'adam'];
  canStartPrediction = false;
  canSaveResults = false;
  generatePredictionTooltip = '';
  undoActions: Array<SudoRedoActionPayload> = [];
  redoActions: Array<SudoRedoActionPayload> = [];

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

  preferredExtensionOptions: Array<
    GeneralConfigSelectOption<PreferredExtension>
  > = [
    {
      value: 'csv',
      viewValue: 'CSV',
    },
    {
      value: 'xlsx',
      viewValue: 'XLSX',
    },
  ];

  private isPredicted = (ctx: any, value: any) => {
    return ctx.p0.raw.isPredicted || ctx.p1.raw.isPredicted ? value : undefined;
  };
  chartData: ChartConfiguration<'line'>['data'] = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        data: [65, 59, NaN, 81, 56, NaN, 72],
        label: 'Random',
        fill: true,
        tension: 0.5,
        borderColor: 'blue',
        segment: {
          borderColor: (ctx) =>
            this.isPredicted(ctx, [10, 10]) ? 'gray' : 'blue',
          borderDash: (ctx: any) => this.isPredicted(ctx, [10, 10]),
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

  chartLegend = true;

  ngOnInit(): void {
    this.loadConfigsFromLocalStorage();
    this.observeTrainingConfigChanged();
    this.observeChartConfigChanged();
    this.observeFileSaveConfigChanged();
    this.observeWorksheetData();
    this.generateRandomData();
  }

  openLoadDataModal(): void {
    const matDialogRef = this.matDialog.open(LoadDataComponent, {
      width: '500px',
      enterAnimationDuration: 200,
      exitAnimationDuration: 300,
    });

    matDialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(({ event, data }) => {
        if (event === 'success' && data.seriesData?.size) {
          this.store.dispatch(
            seriesDataActions.update({
              seriesData: data.seriesData,
              eventSource: 'load',
            })
          );
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  async generatePrediction(): Promise<void> {
    const outputLength = 2;
    const sequenceLength = this.worksheetData.size - outputLength - 1;

    const pastData = Array.from(this.worksheetData.values()).map(
      (data) => data.value
    );
    let { optimizer, learningRate, lossFn, basicLayer, helpLayer } =
      this.trainingConfigFormGroup.value;
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
    model.compile({
      loss: lossFn,
      optimizer:
        optimizer === 'momentum'
          ? tf.train.momentum(learningRate, WorkspaceComponent.MOMENTUM_DEFAULT)
          : tf.train[optimizer](learningRate),
    });

    const { inputTensor, outputTensor } = this.createPredictionSequences(
      pastData,
      sequenceLength
    );

    // Train the model using the data.

    await model.fit(inputTensor, outputTensor, {
      epochs: 100,
      batchSize: 1,
    });

    const lastDataFromPast = pastData
      .slice(-sequenceLength)
      .map((value) => [value]);
    const lastDataFromPastTensor = tf.tensor3d([lastDataFromPast]);

    const prediction = model.predict(lastDataFromPastTensor) as tf.Tensor;
    const predictedData = prediction.dataSync();
    console.log(
      `Next month: ${predictedData[0]}, another month: ${predictedData[1]}`
    );

    const worksheetData = structuredClone(this.worksheetData);

    for (let i = 0; i < predictedData.length; i++) {
      worksheetData.set(`Predicted No ${this.worksheetData.size + i}`, {
        value: predictedData[i],
        label: `Predicted No ${this.worksheetData.size + i}`,
        isPredicted: true,
      });
    }

    this.store.dispatch(
      seriesDataActions.update({
        seriesData: worksheetData,
        eventSource: 'predicted',
      })
    );
  }

  loadData(): void {
    /// To implement
  }

  async startQuickPrediction(): Promise<void> {
    // this.generateRandomData();
    await this.generatePrediction();
  }

  async savePredictionResults(): Promise<void> {
    await this.fileInteractionService.tryToWriteFile(
      this.worksheetData,
      this.fileSaveFormGroup.value?.preferredExtension ?? 'csv'
    );
  }

  generateRandomData(): void {
    const worksheetData: Array<[string, WorksheetRowData]> = Array(24)
      .fill(0)
      .map((_, i) => {
        const utcFullYear = new Date().getUTCFullYear() - (i < 12 ? 1 : 0);
        const label =
          new Date(0, i).toLocaleString('en-US', { month: '2-digit' }) +
          ' / ' +
          utcFullYear;
        return [
          label,
          {
            label,
            value: Math.ceil((Math.random() + 10) * 50),
          },
        ];
      });

    this.store.dispatch(
      seriesDataActions.update({
        seriesData: new Map(worksheetData),
        eventSource: 'randomized',
      })
    );
  }

  performUndo(): void {
    const undoAction = this.undoActions.pop();

    if (!undoAction || !this.worksheetData.size) {
      return;
    }

    this.redoActions.push({
      value: { seriesData: structuredClone(this.worksheetData) },
    });
    this.store.dispatch(
      seriesDataActions.update({
        seriesData: undoAction.value.seriesData,
        eventSource: 'undo',
      })
    );
  }

  performRedo(): void {
    const redoAction = this.redoActions.pop();

    if (!redoAction || !this.worksheetData.size) {
      return;
    }

    this.undoActions.push({
      value: { seriesData: structuredClone(this.worksheetData) },
    });
    this.store.dispatch(
      seriesDataActions.update({
        seriesData: redoAction.value.seriesData,
        eventSource: 'redo',
      })
    );
  }

  private loadConfigsFromLocalStorage(): void {
    this.trainingConfigFormGroup.setValue({
      basicLayer: this.localStorageService.getItem('basicLayer') ?? 'GRU',
      helpLayer: this.localStorageService.getItem('helpLayer') ?? 'Dropout',
      lossFn: this.localStorageService.getItem('lossFn') ?? 'meanSquaredError',
      optimizer: this.localStorageService.getItem('optimizer') ?? 'momentum',
      learningRate: this.localStorageService.getItem('learningRate') ?? 0.001,
    });

    const showLegendFromLS = this.localStorageService.getItem('showLegend');

    this.chartConfigFormGroup.setValue({
      chartType: this.localStorageService.getItem('chartType') ?? 'line',
      showLegend: showLegendFromLS,
    });

    this.fileSaveFormGroup.setValue({
      preferredExtension:
        this.localStorageService.getItem('preferredExtension') ?? 'csv',
    });

    if (showLegendFromLS != null) {
      this.chartLegend = showLegendFromLS;
    }
  }

  private observeTrainingConfigChanged(): void {
    this.trainingConfigFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((formGroupValue) => {
        this.saveConfigToLocalStorage(formGroupValue);
        const learningRateFormControl =
          this.trainingConfigFormGroup.controls.learningRate;

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
        this.chartLegend = formGroupValue.showLegend ?? false;
      });
  }

  private observeFileSaveConfigChanged(): void {
    this.fileSaveFormGroup.valueChanges
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

    return {
      inputTensor: tf.tensor3d(inputSequence),
      outputTensor: tf.tensor2d(outputSequence),
    };
  }

  private updateChartComponent(): void {
    this.chartData.labels = Array.from(this.worksheetData.values()).map(
      (worksheetRowData) => worksheetRowData.label
    );
    this.chartData.datasets[0].data = Array.from(
      this.worksheetData.values()
    ).map((worksheetRowData, index) => ({
      x: index,
      y: worksheetRowData.value,
      isPredicted: worksheetRowData.isPredicted,
    }));
    this.chartComponent().update();
  }

  private observeWorksheetData(): void {
    this.store
      .select(selectSeriesData)
      .subscribe(({ seriesData, eventSource }) => {
        if (
          this.worksheetData.size &&
          eventSource !== 'undo' &&
          eventSource !== 'redo'
        ) {
          if (
            this.undoActions.length <
            WorkspaceComponent.UNDO_REDO_LENGTH_THRESHOLD
          ) {
            this.undoActions.push({
              value: {
                seriesData: this.worksheetData,
              },
            });
          }
        }
        this.worksheetData = seriesData;
        this.canStartPrediction =
          this.worksheetData.size > WorkspaceComponent.MINIMAL_SEQUENCE_LENGTH;
        this.canSaveResults = this.worksheetData.size > 0;

        this.generatePredictionTooltip = this.canStartPrediction
          ? ''
          : 'Cannot start prediction: provided sequence length is less that ' +
            WorkspaceComponent.MINIMAL_SEQUENCE_LENGTH;
        this.updateChartComponent();

        this.changeDetectorRef.detectChanges();
      });
  }
}
