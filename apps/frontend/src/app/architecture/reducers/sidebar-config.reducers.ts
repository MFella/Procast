import { createReducer, on } from '@ngrx/store';
import {
  ChartConfig,
  FileSave,
  TrainingConfig,
} from '../../_typings/workspace/sidebar-config.typings';
import { trainingDefaultConfig } from '../../config/sidebar-config';
import { SidebarConfigState } from '../selectors';
import { sidebarConfigActions } from '../actions/sidebar-config.actions';

const initialChartConfig: ChartConfig = {
  chartType: 'line',
  showLegend: false,
};

const initialTrainingConfig: TrainingConfig = trainingDefaultConfig;

const initialFileSaveConfig: FileSave = {
  preferredExtension: 'csv',
};

export const initialState: SidebarConfigState = {
  sidebarConfig: {
    chartConfig: initialChartConfig,
    fileSave: initialFileSaveConfig,
    trainingConfig: initialTrainingConfig,
  },
};

export const sidebarConfigReducer = createReducer(
  initialState,
  on(sidebarConfigActions.update, (state, { sidebarConfig }) => {
    const finalStateObject = structuredClone(state);
    if (sidebarConfig.chartConfig) {
      finalStateObject.sidebarConfig['chartConfig'] = sidebarConfig.chartConfig;
    }

    if (sidebarConfig.fileSave) {
      finalStateObject.sidebarConfig['fileSave'] = sidebarConfig.fileSave;
    }

    if (sidebarConfig.trainingConfig) {
      finalStateObject.sidebarConfig['trainingConfig'] =
        sidebarConfig.trainingConfig;
    }

    return finalStateObject;
  })
);
