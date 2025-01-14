import { WorksheetRowData } from '../../worksheet.typings';

export type SudoRedoActionPayload = {
  value: {
    seriesData: Map<string, WorksheetRowData>;
  };
};

export type WorksheetUpdateEventSource =
  | 'redo'
  | 'undo'
  | 'load'
  | 'randomized'
  | 'predicted'
  | 'initialized';

export type WorkspaceWorkerMessage = 'predict';

export type DisplayConfigModal = 'config' | 'data' | 'action' | 'user';
