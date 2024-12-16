export type WorksheetRowData = {
  label: string;
  value: number;
};

export type WorksheetColDef = Record<'field', keyof WorksheetRowData> & {
  width?: number;
  editable?: boolean;
};
