import { Component, inject, Input, OnInit } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular'; // Angular Data Grid Component
import {
  CellEditRequestEvent,
  GridOptions,
  GridReadyEvent,
  RowDataUpdatedEvent,
} from 'ag-grid-community';
import {
  WorksheetColDef,
  WorksheetRowData,
} from '../_typings/worksheet.typings';
import { Store } from '@ngrx/store';
import { seriesDataActions } from '../architecture/actions/series-data.actions';

@Component({
  selector: 'app-worksheet',
  imports: [AgGridModule],
  templateUrl: './worksheet.component.html',
  styleUrl: './worksheet.component.scss',
})
export class WorksheetComponent implements OnInit {
  @Input({ required: true })
  worksheetData: Map<string, WorksheetRowData> = new Map();

  store: Store = inject(Store);

  monthsInYear = Array.from({ length: 12 }, (item, i) => {
    return new Date(0, i).toLocaleString('en-US', { month: 'long' });
  });

  colDefs: Array<WorksheetColDef> = [
    { field: 'label', editable: false },
    { field: 'value', editable: true },
  ];

  gridOptions: GridOptions = {
    // isFullWidthRow: () => true,
    onRowDataUpdated: this.onRowDataUpdated.bind(this),
    readOnlyEdit: true,
    onCellEditRequest: (event: CellEditRequestEvent) => {
      if (!event.value || event.value < 0) {
        return;
      }

      this.store.dispatch(
        seriesDataActions.singleUpdate({
          key: event.data.label,
          value: event.value,
        })
      );
      // the application should update the data somehow
    },
  };

  get convertedWorksheetData(): Array<WorksheetRowData> {
    return Array.from(this.worksheetData.values());
  }

  ngOnInit(): void {}

  onGridReady($event: GridReadyEvent): void {
    $event.api.sizeColumnsToFit();
  }

  onRowDataUpdated($event: RowDataUpdatedEvent): void {
    console.log($event);
  }
}
