export type WorksheetRowData = {
  label: string;
  value: string | number;
};

export type WorksheetColDef = Record<'field', keyof WorksheetRowData> & {
  width?: number;
  editable?: boolean;
};
