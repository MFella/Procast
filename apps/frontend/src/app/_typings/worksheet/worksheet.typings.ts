export type WorksheetRowData = {
  label: string;
  value: number;
  isPredicted?: boolean;
};

export type WorksheetColDef = Record<'field', keyof WorksheetRowData> & {
  width?: number;
  editable?: boolean;
};
