import { createActionGroup, props } from '@ngrx/store';
import { WorksheetRowData } from '../../_typings/worksheet.typings';

export const seriesDataActions = createActionGroup({
  source: 'Series Data',
  events: {
    Update: props<{ seriesData: Map<string, WorksheetRowData> }>(),
    SingleUpdate: props<{ key: string; value: number }>(),
  },
});
