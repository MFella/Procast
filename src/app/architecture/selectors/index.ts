import { createFeatureSelector } from '@ngrx/store';
import { WorksheetRowData } from '../../_typings/worksheet.typings';
import { WorksheetUpdateEventSource } from '../../_typings/workspace/actions/workspace-actions.typings';
import { SidebarConfig } from '../../_typings/workspace/sidebar-config.typings';

export interface SeriesDataState {
  seriesData: Map<string, WorksheetRowData>;
  eventSource: WorksheetUpdateEventSource;
}

export interface SidebarConfigState {
  sidebarConfig: SidebarConfig;
}

export const selectSeriesData =
  createFeatureSelector<SeriesDataState>('seriesData');

export const selectSidebarConfig =
  createFeatureSelector<SidebarConfigState>('sidebarConfig');
