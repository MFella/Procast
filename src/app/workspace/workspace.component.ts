import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { WorksheetComponent } from '../worksheet/worksheet.component';
import { MatDialog } from '@angular/material/dialog';
import { LoadDataComponent } from '../load-data/load-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  ChartConfig,
  FileSave,
  Optimizer,
  TrainingConfig,
} from '../_typings/workspace/sidebar-config.typings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';
import { WorksheetRowData } from '../_typings/worksheet.typings';
import { Store } from '@ngrx/store';
import { seriesDataActions } from '../architecture/actions/series-data.actions';
import {
  selectSeriesData,
  selectSidebarConfig,
} from '../architecture/selectors';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DisplayConfigModal,
  SudoRedoActionPayload,
  WorkspaceWorkerMessage,
} from '../_typings/workspace/actions/workspace-actions.typings';
import { FileInteractionService } from '../_services/file-interaction.service';
import { Predictor } from '../_helpers/predictor';
import { TypeHelper } from '../_helpers/type-helper';
import { AlertService } from '../_services/alert.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { take } from 'rxjs';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';

@Component({
  selector: 'app-workspace',
  imports: [
    BaseChartDirective,
    WorksheetComponent,
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
    SidebarComponent,
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

  private readonly matDialog = inject(MatDialog);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly store = inject(Store);
  private readonly fileInteractionService = inject(FileInteractionService);
  readonly #destroyRef = inject(DestroyRef);
  private readonly alertService = inject(AlertService);

  private trainingConfig?: TrainingConfig;
  private fileSaveConfig?: FileSave;
  chartConfig?: ChartConfig;

  worksheetData: Map<string, WorksheetRowData> = new Map<
    string,
    WorksheetRowData
  >();
  isPredictionInProgress = false;
  lastPredictionFailed = false;

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
  lastPerformedUserAction?: DisplayConfigModal;

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
    scales: {
      y: {
        ticks: {
          display: false,
        },
      },
      x: {
        ticks: {
          display: false,
        },
      },
    },
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
    this.observeSidebarConfigChanged();
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
        if (this.trainingConfig) {
          generatedPrediction = await Predictor.generatePrediction(
            this.worksheetData,
            this.trainingConfig,
            () => {}
          );
        }
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
    if (this.fileSaveConfig) {
      await this.fileInteractionService.tryToWriteFile(
        this.worksheetData,
        this.fileSaveConfig.preferredExtension,
        this.worksheetName
      );
    }
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

  setChartConfig(chartConfig: ChartConfig): void {
    this.chartConfig = chartConfig;
  }

  setFileSaveConfig(fileSaveConfig: FileSave): void {
    this.fileSaveConfig = fileSaveConfig;
  }

  setTrainingConfig(trainingConfig: TrainingConfig): void {
    this.trainingConfig = trainingConfig;
  }

  displayInteractionModal(
    $event: DisplayConfigModal,
    templateRef: TemplateRef<any>
  ): void {
    this.lastPerformedUserAction = $event;

    const interactionModalRef = this.matDialog.open(GenericModalComponent, {
      width: '100%',
      height: '100%',
      enterAnimationDuration: 200,
      exitAnimationDuration: 300,
      data: {
        templateRef,
      },
    });

    interactionModalRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.lastPerformedUserAction = undefined;
        this.changeDetectorRef.detectChanges();
      });
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
        trainingConfig: this.trainingConfig,
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

  private observeSidebarConfigChanged(): void {
    this.store
      .select(selectSidebarConfig)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(({ sidebarConfig }) => {
        if (sidebarConfig.chartConfig) {
          this.setChartConfig(sidebarConfig.chartConfig);
          this.chartLegend = sidebarConfig.chartConfig.showLegend;
        }

        if (sidebarConfig.fileSave) {
          this.setFileSaveConfig(sidebarConfig.fileSave);
        }

        if (sidebarConfig.trainingConfig) {
          this.setTrainingConfig(sidebarConfig.trainingConfig);
        }

        this.changeDetectorRef.detectChanges();
      });
  }
}
