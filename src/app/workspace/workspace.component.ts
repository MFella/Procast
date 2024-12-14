import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  Renderer2,
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
} from '../_typings/workspace/sidebar-config.typings';
import { NgStyle } from '@angular/common';
import { LocalStorageService } from '../local-storage.service';
import { LocalStorageMappings } from '../_typings/local-storage/local-storage.typings';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCheckboxModule } from '@angular/material/checkbox';

type TrainingConfigFormGroup = {
  basicLayer: FormControl<BasicLayer | null>;
  helpLayer: FormControl<HelpLayer | null>;
  lossFn: FormControl<LossFn | null>;
  optimizer: FormControl<Optimizer | null>;
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
    NgStyle,
    MatCheckboxModule,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly matDialog = inject(MatDialog);
  private readonly renderer2 = inject(Renderer2);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  #destroyRef = inject(DestroyRef);
  private loadedData: Array<any> = [];

  traningConfigFormGroup = new FormGroup<TrainingConfigFormGroup>({
    basicLayer: new FormControl('GRU', [Validators.required]),
    helpLayer: new FormControl('Dropout', [Validators.required]),
    lossFn: new FormControl('meanSquaredError', [Validators.required]),
    optimizer: new FormControl('momentum', [Validators.required]),
  });

  chartConfigFormGroup = new FormGroup<ChartConfigFormGroup>({
    showLegend: new FormControl(false, [Validators.required]),
    chartType: new FormControl('line', [Validators.required]),
  });

  isExpanded = false;

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
  lineChartData: ChartConfiguration<'line'>['data'] = {
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

  generatePrediction(): void {
    // Define a model for linear regression.
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    // Generate some synthetic data for training.
    const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
    const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

    // Train the model using the data.
    model.fit(xs, ys).then(() => {
      // Use the model to do inference on a data point the model hasn't seen before:
      const result = model.predict(tf.tensor2d([5], [1, 1])) as tf.Tensor;
    });
  }

  loadData(): void {
    /// To implement
  }

  private loadConfigsFromLocalStorage(): void {
    this.traningConfigFormGroup.setValue({
      basicLayer: this.localStorageService.getItem('basicLayer') ?? 'GRU',
      helpLayer: this.localStorageService.getItem('helpLayer') ?? 'Dropout',
      lossFn: this.localStorageService.getItem('lossFn') ?? 'meanSquaredError',
      optimizer: this.localStorageService.getItem('optimizer') ?? 'momentum',
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

  toggleAnimation(
    listRef: HTMLUListElement,
    detailsRef: HTMLDetailsElement
  ): void {
    setTimeout(() => {
      if (typeof detailsRef.open === 'boolean') {
        const animationClasses = ['fade-in', 'fade-out'];
        this.renderer2.removeClass(
          listRef,
          animationClasses[detailsRef.open ? 1 : 0]
        );
        this.renderer2.addClass(
          listRef,
          animationClasses[detailsRef.open ? 0 : 1]
        );
      }
    });
  }
}
