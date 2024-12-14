import { Component, Input, OnInit } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular'; // Angular Data Grid Component
import { GridOptions, GridReadyEvent } from 'ag-grid-community';
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
export class WorksheetComponent implements OnInit {
  @Input({ required: true })
  worksheetData!: Array<WorksheetRowData>;

  monthsInYear = Array.from({ length: 12 }, (item, i) => {
    return new Date(0, i).toLocaleString('en-US', { month: 'long' });
  });

  rowData: Array<WorksheetRowData> = [];

  colDefs: Array<WorksheetColDef> = [
    { field: 'label', editable: true },
    { field: 'value', editable: true },
  ];

  gridOptions: GridOptions = {
    // isFullWidthRow: () => true,
  };

  ngOnInit(): void {
    this.generateMockData();
  }

  onGridReady($event: GridReadyEvent): void {
    $event.api.sizeColumnsToFit();
  }

  generateMockData(): void {
    // this.rowData =
  }
}
