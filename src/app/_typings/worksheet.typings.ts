export type WorksheetRowData = {
  make: string;
  model: string;
  electric: boolean;
  price: number;
};

export type WorksheetColDef = Record<'field', keyof WorksheetRowData> & {
  width?: number;
  editable?: boolean;
};
