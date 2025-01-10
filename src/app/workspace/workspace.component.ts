import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
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
  GenericFormGroup,
  TrainingConfig,
  ChartConfig,
  FileSave,
} from '../_typings/workspace/sidebar-config.typings';
import { LocalStorageService } from '../local-storage.service';
import { LocalStorageMappings } from '../_typings/local-storage/local-storage.typings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { WorksheetRowData } from '../_typings/worksheet.typings';
import { Store } from '@ngrx/store';
import { seriesDataActions } from '../architecture/actions/series-data.actions';
import { selectSeriesData } from '../architecture/selectors';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  SudoRedoActionPayload,
  WorkspaceWorkerMessage,
} from '../_typings/workspace/actions/workspace-actions.typings';
import { FileInteractionService } from '../_services/file-interaction.service';
import { Predictor } from '../_helpers/predictor';
import {
  basicLayerOptions,
  chartTypeOptions,
  helpLayerOptions,
  lossFnOptions,
  optimizerOptions,
  preferredExtensionOptions,
  showLegendOptions,
  trainingDefaultConfig,
} from '../config/sidebar-config';
import { TypeHelper } from '../_helpers/type-helper';
import { AlertService } from '../_services/alert.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProgressBarMode } from '@angular/material/progress-bar';

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
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent implements OnInit {
  private chartComponent = viewChild.required(BaseChartDirective);
  private worksheetNameInput = viewChild.required('worksheetNameInput');
  private static PREDICTION_WORKER: Worker;

  private static readonly MINIMAL_SEQUENCE_LENGTH = 6;
  private static readonly UNDO_REDO_LENGTH_THRESHOLD = 20;
  private static readonly FILE_EXTENSION_DEFAULT = 'csv';

  private readonly localStorageService = inject(LocalStorageService);
  private readonly matDialog = inject(MatDialog);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly store = inject(Store);
  private readonly fileInteractionService = inject(FileInteractionService);
  readonly #destroyRef = inject(DestroyRef);
  private readonly alertService = inject(AlertService);

  worksheetData: Map<string, WorksheetRowData> = new Map<
    string,
    WorksheetRowData
  >();
  isPredictionInProgress = false;
  lastPredictionFailed = false;

  trainingConfigFormGroup = new FormGroup<GenericFormGroup<TrainingConfig>>({
    basicLayer: new FormControl(trainingDefaultConfig.basicLayer, [
      Validators.required,
    ]),
    helpLayer: new FormControl(trainingDefaultConfig.helpLayer, [
      Validators.required,
    ]),
    lossFn: new FormControl(trainingDefaultConfig.lossFn, [
      Validators.required,
    ]),
    optimizer: new FormControl(trainingDefaultConfig.optimizer, [
      Validators.required,
    ]),
    learningRate: new FormControl(trainingDefaultConfig.learningRate, []),
  });

  chartConfigFormGroup = new FormGroup<GenericFormGroup<ChartConfig>>({
    showLegend: new FormControl(false, [Validators.required]),
    chartType: new FormControl('line', [Validators.required]),
  });

  fileSaveFormGroup = new FormGroup<GenericFormGroup<FileSave>>({
    preferredExtension: new FormControl('csv', [Validators.required]),
  });

  isEditingWorksheetName = false;
  worksheetName = 'Untilted';
  computationProgressValue: number = 0;
  computationProgressBarMode: ProgressBarMode = 'determinate';

  excludedOptimizersFromLearningRate: Array<Optimizer> = ['adadelta'];
  canStartPrediction = false;
  canSaveResults = false;
  generatePredictionTooltip = '';
  undoActions: Array<SudoRedoActionPayload> = [];
  redoActions: Array<SudoRedoActionPayload> = [];

  basicLayerOptions: Array<GeneralConfigSelectOption<BasicLayer>> =
    basicLayerOptions;

  helpLayerOptions: Array<GeneralConfigSelectOption<HelpLayer>> =
    helpLayerOptions;

  lossFnOptions: Array<GeneralConfigSelectOption<LossFn>> = lossFnOptions;

  optimizerOptions: Array<GeneralConfigSelectOption<Optimizer>> =
    optimizerOptions;

  chartTypeOptions: Array<GeneralConfigSelectOption<ChartType>> =
    chartTypeOptions;

  showLegendOptions: Array<GeneralConfigSelectOption<ShowLegend>> =
    showLegendOptions;

  preferredExtensionOptions: Array<
    GeneralConfigSelectOption<PreferredExtension>
  > = preferredExtensionOptions;

  private isPredicted = (ctx: any, value: any) => {
    return ctx.p0?.raw?.isPredicted || ctx.p1?.raw?.isPredicted
      ? value
      : undefined;
  };

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        data: [65, 59, NaN, 81, 56, NaN, 72],
        label: this.worksheetName,
        fill: true,
        tension: 0.2,
        borderColor: 'blue',
        segment: {
          borderColor: (ctx) =>
            this.isPredicted(ctx, [10, 10]) ? 'gray' : 'blue',
          borderDash: (ctx: any) => this.isPredicted(ctx, [10, 10]),
          backgroundColor: (ctx: any) =>
            this.isPredicted(ctx, [10, 10])
              ? 'rgba(266, 232, 240, .4)'
              : 'rgba(224, 242, 254, .6)',
        },
        spanGaps: true,
      },
    ],
  };

  chartOptions: ChartOptions<ChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 0.1,
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
      width: '700px',
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
    try {
      this.lastPredictionFailed = false;
      this.computationProgressBarMode = 'query';
      this.isPredictionInProgress = true;
      let generatedPrediction: Array<number> = [];
      if (typeof Worker !== 'undefined') {
        generatedPrediction = await this.processMessageToWebWorker('predict');
      } else {
        generatedPrediction = await Predictor.generatePrediction(
          this.worksheetData,
          this.trainingConfigFormGroup.value as TrainingConfig,
          () => {}
        );
      }

      this.applyGeneratedPrediction(generatedPrediction);
      this.isPredictionInProgress = false;
    } catch (error: unknown) {
      this.isPredictionInProgress = false;
      this.lastPredictionFailed = true;
      if (TypeHelper.isUnknownAnObject(error, 'message')) {
        this.alertService.showErrorSnackBar(error.message);
      } else {
        this.alertService.showErrorSnackBar(
          'Unrecognized error occured during forecast generation'
        );
      }
    }

    this.changeDetectorRef.detectChanges();
  }

  async startQuickPrediction(): Promise<void> {
    await this.generatePrediction();
  }

  async savePredictionResults(): Promise<void> {
    await this.fileInteractionService.tryToWriteFile(
      this.worksheetData,
      this.fileSaveFormGroup.value?.preferredExtension ??
        WorkspaceComponent.FILE_EXTENSION_DEFAULT,
      this.worksheetName
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
            value: Math.ceil((Math.random() + 10) * 500),
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

  setEditingWorksheetNameState(isEditing: boolean = true): void {
    this.isEditingWorksheetName = isEditing;
    if (isEditing) {
      setTimeout(() => {
        const worksheetNameInput = this.worksheetNameInput();
        if (TypeHelper.isUnknownAnObject(worksheetNameInput, 'nativeElement')) {
          worksheetNameInput.nativeElement.focus();
          worksheetNameInput.nativeElement.select();
        }
      });
    }
    this.changeDetectorRef.detectChanges();
  }

  submitWorksheetTitle(worksheetInputValue: string): void {
    if (worksheetInputValue) {
      this.worksheetName = worksheetInputValue;
      this.changeDetectorRef.detectChanges();
    }

    this.setEditingWorksheetNameState(false);
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
            ) && learningRateFormControl.disabled !== true;

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

  private async processMessageToWebWorker(
    workspaceWorkerMessage: WorkspaceWorkerMessage
  ): Promise<Array<number>> {
    if (!WorkspaceComponent.PREDICTION_WORKER) {
      WorkspaceComponent.PREDICTION_WORKER = new Worker(
        new URL('./workspace.worker', import.meta.url)
      );
    }

    return new Promise((resolve, reject) => {
      WorkspaceComponent.PREDICTION_WORKER.onmessage = ({ data }) => {
        if (data.event === 'success' && 'prediction' in data) {
          resolve(data.prediction);
        } else if (data.event === 'progress') {
          this.computationProgressBarMode = 'determinate';
          this.computationProgressValue = data.value;
          this.changeDetectorRef.detectChanges();
        } else {
          reject({ message: data.message });
        }
      };

      WorkspaceComponent.PREDICTION_WORKER.onerror = ({}) => {
        reject('Error occured during generation of forecast in service worker');
      };

      WorkspaceComponent.PREDICTION_WORKER.postMessage({
        message: workspaceWorkerMessage,
        worksheetData: this.worksheetData,
        trainingConfig: this.trainingConfigFormGroup.value,
      });
    });
  }

  private applyGeneratedPrediction(generatedPrediction: Array<number>): void {
    const worksheetData = structuredClone(this.worksheetData);

    for (let i = 0; i < generatedPrediction.length; i++) {
      worksheetData.set(`Predicted No ${this.worksheetData.size + i}`, {
        value: parseInt(generatedPrediction[i] as any),
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
}
