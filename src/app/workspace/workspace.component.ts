import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { ChartConfiguration, ChartOptions } from 'chart.js';
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
  PredictConfigSelectOption,
} from '../_typings/workspace/sidebar-config.typings';
import { NgStyle } from '@angular/common';
import { LocalStorageService } from '../local-storage.service';
import { LocalStorageMappings } from '../_typings/local-storage/local-storage.typings';

type TraningfConfigFormGroup = {
  basicLayer: FormControl<BasicLayer | null>;
  helpLayer: FormControl<HelpLayer | null>;
  lossFn: FormControl<LossFn | null>;
  optimizer: FormControl<Optimizer | null>;
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
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly matDialog = inject(MatDialog);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private loadedData: Array<any> = [];

  traningConfigFormGroup = new FormGroup<TraningfConfigFormGroup>({
    basicLayer: new FormControl('GRU', [Validators.required]),
    helpLayer: new FormControl('Dropout', [Validators.required]),
    lossFn: new FormControl('meanSquaredError', [Validators.required]),
    optimizer: new FormControl('momentum', [Validators.required]),
  });

  isExpanded = false;

  basicLayerOptions: Array<PredictConfigSelectOption<BasicLayer>> = [
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

  helpLayerOptions: Array<PredictConfigSelectOption<HelpLayer>> = [
    {
      value: 'Dropout',
      viewValue: 'Dropout',
    },
    {
      value: 'BatchNormalization',
      viewValue: 'Batch Normalization',
    },
  ];

  lossFnOptions: Array<PredictConfigSelectOption<LossFn>> = [
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

  optimizerOptions: Array<PredictConfigSelectOption<Optimizer>> = [
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

  private skipped = (ctx: any, value: any) =>
    ctx.p0.skip || ctx.p1.skip ? value : undefined;
  private down = (ctx: any, value: any) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
  public lineChartData: ChartConfiguration<'line'>['data'] = {
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
  public lineChartOptions: ChartOptions<'line'> = {
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

  public lineChartLegend = true;

  ngOnInit(): void {
    this.loadConfigFromLocalStorage();
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

  private loadConfigFromLocalStorage(): void {
    this.traningConfigFormGroup.setValue({
      basicLayer: this.localStorageService.getItem('basicLayer') ?? 'GRU',
      helpLayer: this.localStorageService.getItem('helpLayer') ?? 'Dropout',
      lossFn: this.localStorageService.getItem('lossFn') ?? 'meanSquaredError',
      optimizer: this.localStorageService.getItem('optimizer') ?? 'momentum',
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
}
