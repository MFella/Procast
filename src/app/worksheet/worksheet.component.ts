import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
  CellEditRequestEvent,
  GridOptions,
  GridReadyEvent,
} from 'ag-grid-community';
import {
  WorksheetColDef,
  WorksheetRowData,
} from '../_typings/worksheet.typings';
import { Store } from '@ngrx/store';
import { seriesDataActions } from '../architecture/actions/series-data.actions';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-worksheet',
  imports: [AgGridModule, NgClass],
  templateUrl: './worksheet.component.html',
  styleUrl: './worksheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksheetComponent implements OnInit {
  @Input({ required: true })
  worksheetData: Map<string, WorksheetRowData> = new Map();

  @Input({ required: true })
  isPredictionInProgress!: boolean;

  store: Store = inject(Store);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  monthsInYear = Array.from({ length: 12 }, (item, i) => {
    return new Date(0, i).toLocaleString('en-US', { month: 'long' });
  });

  colDefs: Array<WorksheetColDef> = [
    { field: 'label', editable: false },
    { field: 'value', editable: true },
  ];

  gridOptions: GridOptions = {
    // isFullWidthRow: () => true,
    readOnlyEdit: true,
    onCellEditRequest: this.handleCellEditRequest.bind(this),
  };

  get convertedWorksheetData(): Array<WorksheetRowData> {
    return Array.from(this.worksheetData.values());
  }

  ngOnInit(): void {}

  onGridReady($event: GridReadyEvent): void {
    $event.api.sizeColumnsToFit();
  }

  private handleCellEditRequest(event: CellEditRequestEvent): void {
    if (!event.value || event.value < 0) {
      return;
    }

    this.store.dispatch(
      seriesDataActions.singleUpdate({
        key: event.data.label,
        value: event.value,
      })
    );
  }
}
