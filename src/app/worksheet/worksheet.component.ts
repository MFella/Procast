import { Component } from '@angular/core';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular'; // Angular Data Grid Component
import { ColDef, GridOptions } from 'ag-grid-community';
import {
  WorksheetColDef,
  WorksheetRowData,
} from '../_typings/worksheet.typings';

@Component({
  selector: 'app-worksheet',
  imports: [AgGridModule],
  templateUrl: './worksheet.component.html',
  styleUrl: './worksheet.component.scss',
})
export class WorksheetComponent {
  rowData: Array<WorksheetRowData> = [
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
  ];

  colDefs: Array<WorksheetColDef> = [
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'electric', width: 100 },
  ];

  gridOptions: GridOptions = {
    isFullWidthRow: () => true,
  };
}
