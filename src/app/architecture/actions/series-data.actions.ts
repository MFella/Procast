import { createActionGroup, props } from '@ngrx/store';
import { WorksheetRowData } from '../../_typings/worksheet.typings';
import { WorksheetUpdateEventSource } from '../../_typings/workspace/actions/workspace-actions.typings';

export const seriesDataActions = createActionGroup({
  source: 'Series Data',
  events: {
    Update: props<{
      seriesData: Map<string, WorksheetRowData>;
      eventSource: WorksheetUpdateEventSource;
    }>(),
    SingleUpdate: props<{ key: string; value: number }>(),
  },
});
