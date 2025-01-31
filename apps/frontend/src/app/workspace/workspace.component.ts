import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  Inject,
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
import {
  AsyncPipe,
  DOCUMENT,
  NgClass,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import { WorksheetRowData } from '../_typings/worksheet/worksheet.typings';
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
} from '../_typings/workspace/actions/workspace-actions.typings';
import { FileInteractionService } from '../_services/file-interaction.service';
import { TypeHelper } from '../_helpers/type-helper';
import { AlertService } from '../_services/alert.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatProgressBarModule,
  ProgressBarMode,
} from '@angular/material/progress-bar';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { firstValueFrom, map, Observable, take } from 'rxjs';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';
import { ActionButtonConfig } from '../_typings/action-buttons/action-buttons.typings';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PredictionService } from '../_services/prediction.service';

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
    NgTemplateOutlet,
    ActionButtonComponent,
    MatProgressBarModule,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent implements OnInit {
  private chartComponent = viewChild.required(BaseChartDirective);
  private worksheetNameInput = viewChild.required('worksheetNameInput');

  private static readonly MINIMAL_SEQUENCE_LENGTH = 6;
  private static readonly UNDO_REDO_LENGTH_THRESHOLD = 20;
  private static readonly CHART_AXES_HIDE_THRESHOLD_PX = 500;

  private readonly matDialog = inject(MatDialog);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly store = inject(Store);
  private readonly fileInteractionService = inject(FileInteractionService);
  readonly #destroyRef = inject(DestroyRef);
  private readonly alertService = inject(AlertService);
  private readonly predictionService = inject(PredictionService);

  private trainingConfig?: TrainingConfig;
  private fileSaveConfig?: FileSave;

  isMobile$: Observable<boolean> = inject(BreakpointObserver)
    .observe([Breakpoints.XSmall])
    .pipe(map((breakpointState) => !breakpointState.matches));
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
  resizeObserver: ResizeObserver = new ResizeObserver(
    this.onResizeObserverCb.bind(this)
  );

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
          display: true,
        },
      },
      x: {
        ticks: {
          display: true,
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

  actionButtonConfigList: Array<ActionButtonConfig> = [
    {
      label: 'Generate',
      iconName: 'play',
      clickCallback: this.generatePrediction.bind(this),
      resolveLinkDisabled: () =>
        !this.canStartPrediction || this.isPredictionInProgress,
    },
    {
      label: 'Load',
      iconName: 'import',
      clickCallback: this.openLoadDataModal.bind(this),
      resolveLinkDisabled: () => this.isPredictionInProgress,
    },
    {
      label: 'Random',
      iconName: 'blitz',
      clickCallback: this.generateRandomData.bind(this),
      resolveLinkDisabled: () => this.isPredictionInProgress,
    },
    {
      label: 'Save',
      iconName: 'export',
      clickCallback: this.savePredictionResults.bind(this),
      resolveLinkDisabled: () => this.isPredictionInProgress,
    },
    {
      label: 'Redo',
      iconName: 'redo',
      clickCallback: this.performRedo.bind(this),
      resolveLinkDisabled: () =>
        !this.redoActions.length || this.isPredictionInProgress,
    },
    {
      label: 'Undo',
      iconName: 'undo',
      clickCallback: this.performUndo.bind(this),
      resolveLinkDisabled: () =>
        !this.undoActions.length || this.isPredictionInProgress,
    },
  ];

  constructor(@Inject(DOCUMENT) readonly document: Document) {
    this.resizeObserver.observe(document.body);
  }

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
      const data = Array.from(this.worksheetData.values()).map(
        (entry) => entry.value
      );
      const predictionResult = await firstValueFrom(
        this.predictionService.startPrediction(data, this.trainingConfig!)
      );

      this.computationProgressValue = 100;
      this.lastPredictionFailed = false;
      generatedPrediction = predictionResult.result;

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

  addNewSheet($event: Event): void {
    $event.stopPropagation();
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

  private onResizeObserverCb(entries: Array<ResizeObserverEntry>): void {
    const firstEntry = entries[0];
    if (!firstEntry) {
      return;
    }

    const { width: bodyWidth } = firstEntry.contentRect;

    const shouldAxesBeVisible =
      bodyWidth > WorkspaceComponent.CHART_AXES_HIDE_THRESHOLD_PX;
    if (
      this.chartOptions.scales?.['x']?.['ticks']?.['display'] !==
        shouldAxesBeVisible &&
      this.chartOptions.scales?.['y']?.['ticks']?.['display'] !==
        shouldAxesBeVisible
    ) {
      const chartOptionsClone = structuredClone(this.chartOptions);
      this.chartOptions = {
        ...chartOptionsClone,
        scales: {
          x: {
            ticks: {
              display: shouldAxesBeVisible,
            },
          },
          y: {
            ticks: {
              display: shouldAxesBeVisible,
            },
          },
        },
      };
      this.chartComponent().update();
      this.changeDetectorRef.detectChanges();
    }
  }
}
