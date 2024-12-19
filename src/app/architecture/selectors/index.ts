import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorksheetRowData } from '../../_typings/worksheet.typings';
import { WorksheetUpdateEventSource } from '../../_typings/workspace/actions/workspace-actions.typings';

export interface SeriesDataState {
  seriesData: Map<string, WorksheetRowData>;
  eventSource: WorksheetUpdateEventSource;
}

export const selectSeriesData =
  createFeatureSelector<SeriesDataState>('seriesData');
