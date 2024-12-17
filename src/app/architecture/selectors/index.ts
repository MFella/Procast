import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorksheetRowData } from '../../_typings/worksheet.typings';

export interface SeriesDataState {
  seriesData: Map<string, WorksheetRowData>;
}

export const selectSeriesData =
  createFeatureSelector<SeriesDataState>('seriesData');
