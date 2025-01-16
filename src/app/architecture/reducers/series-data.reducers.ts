import { createReducer, on } from '@ngrx/store';
import { seriesDataActions } from '../actions/series-data.actions';
import { SeriesDataState } from '../selectors';
import { WorksheetRowData } from '../../_typings/worksheet/worksheet.typings';

export const initialState: SeriesDataState = {
  seriesData: new Map<string, WorksheetRowData>(),
  eventSource: 'initialized',
};

export const seriesDataReducer = createReducer(
  initialState,
  on(seriesDataActions.update, (state, { seriesData, eventSource }) => ({
    ...state,
    seriesData,
    eventSource,
  })),
  on(seriesDataActions.singleUpdate, (state, { key, value }) => {
    const entityToUpdate = state.seriesData.get(key);
    if (!entityToUpdate) {
      return state;
    }

    state.seriesData.set(key, {
      label: key,
      value,
      isPredicted: entityToUpdate.isPredicted,
    });

    return { ...state, seriesData: new Map(state.seriesData) };
  })
);
