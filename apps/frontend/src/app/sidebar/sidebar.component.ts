import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BasicLayer,
  ChartConfig,
  FileSave,
  GeneralConfigSelectOption,
  GenericFormGroup,
  HelpLayer,
  LossFn,
  Optimizer,
  PreferredExtension,
  ShowLegend,
  TrainingConfig,
} from '../_typings/workspace/sidebar-config.typings';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { ChartType } from 'chart.js';
import { MatSelectModule } from '@angular/material/select';
import { LocalStorageService } from '../local-storage.service';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalStorageMappings } from '../_typings/local-storage/local-storage.typings';
import { sidebarConfigActions } from '../architecture/actions/sidebar-config.actions';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AvailableCachedTrainingOptionsDTO } from '../_dtos/prediction/available-cached-training-options.dto';
import { TrainingConverter } from '../_helpers/training-converter';

@Component({
  selector: 'app-sidebar',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private readonly store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly cachedTrainConfigOpts = input<AvailableCachedTrainingOptionsDTO>();

  excludedOptimizersFromLearningRate: Array<Optimizer> = ['adadelta'];
  private readonly localStorageService = inject(LocalStorageService);
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

  chartConfigFormGroup = new FormGroup<GenericFormGroup<ChartConfig>>({
    showLegend: new FormControl(false, [Validators.required]),
    chartType: new FormControl('line', [Validators.required]),
  });

  fileSaveFormGroup = new FormGroup<GenericFormGroup<FileSave>>({
    preferredExtension: new FormControl('csv', [Validators.required]),
  });

  ngOnInit(): void {
    this.loadConfigsFromLocalStorage();
    this.observeFileSaveConfigChanged();
    this.observeChartConfigChanged();
    this.observeTrainingConfigChanged();
  }

  convertLayerOption<T>(layer: T): T {
    return TrainingConverter.convertLayerToTensorFn(layer as any);
  }

  handleSummaryOpenStateChange(
    ...summaryRefs: Array<HTMLDetailsElement>
  ): void {
    summaryRefs.forEach((detailsElement: HTMLDetailsElement) => {
      if (detailsElement.hasAttribute('open')) {
      }
    });
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
      // this.chartLegend = showLegendFromLS;
    }

    this.store.dispatch(
      sidebarConfigActions.update({
        sidebarConfig: {
          chartConfig: this.chartConfigFormGroup.value as ChartConfig,
          fileSave: this.fileSaveFormGroup.value as FileSave,
          trainingConfig: this.trainingConfigFormGroup.value as TrainingConfig,
        },
      })
    );
  }

  private observeChartConfigChanged(): void {
    this.chartConfigFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((formGroupValue) => {
        this.saveConfigToLocalStorage(formGroupValue);
        this.store.dispatch(
          sidebarConfigActions.update({
            sidebarConfig: {
              chartConfig: formGroupValue as ChartConfig,
            },
          })
        );
      });
  }

  private observeTrainingConfigChanged(): void {
    this.trainingConfigFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((formGroupValue) => {
        const learningRateFormControl =
          this.trainingConfigFormGroup.controls.learningRate;

        if (formGroupValue.optimizer && learningRateFormControl) {
          const shouldDisableLearningRate =
            this.excludedOptimizersFromLearningRate.includes(
              formGroupValue.optimizer
            ) && learningRateFormControl.disabled !== true;

          shouldDisableLearningRate && learningRateFormControl.disable();
        }

        this.saveConfigToLocalStorage(formGroupValue);
        this.store.dispatch(
          sidebarConfigActions.update({
            sidebarConfig: {
              trainingConfig: formGroupValue as TrainingConfig,
            },
          })
        );
      });
  }

  private observeFileSaveConfigChanged(): void {
    this.fileSaveFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((formGroupValue) => {
        this.saveConfigToLocalStorage(formGroupValue);
        this.store.dispatch(
          sidebarConfigActions.update({
            sidebarConfig: {
              fileSave: {
                preferredExtension: formGroupValue.preferredExtension!,
              },
            },
          })
        );
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
}
