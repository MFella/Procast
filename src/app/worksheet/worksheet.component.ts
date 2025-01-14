import {
  ChangeDetectionStrategy,
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
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  MatProgressBarModule,
  ProgressBarMode,
} from '@angular/material/progress-bar';
import { map, Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-worksheet',
  imports: [AgGridModule, NgClass, MatProgressBarModule, AsyncPipe, NgIf],
  templateUrl: './worksheet.component.html',
  styleUrl: './worksheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksheetComponent implements OnInit {
  @Input({ required: true })
  worksheetData: Map<string, WorksheetRowData> = new Map();

  @Input({ required: true })
  isPredictionInProgress!: boolean;

  @Input()
  computationProgressValue: number = 0;

  @Input()
  progressBarMode: ProgressBarMode = 'determinate';

  @Input()
  lastPredictionFailed: boolean = false;

  store: Store = inject(Store);
  isMobile$: Observable<boolean> = inject(BreakpointObserver)
    .observe([Breakpoints.Small])
    .pipe(map((breakpointState) => breakpointState.matches));

  monthsInYear = Array.from({ length: 12 }, (_, i) => {
    return new Date(0, i).toLocaleString('en-US', { month: 'long' });
  });

  colDefs: Array<WorksheetColDef> = [
    { field: 'label', editable: false },
    { field: 'value', editable: true },
  ];

  gridOptions: GridOptions = {
    readOnlyEdit: true,
    suppressScrollOnNewData: true,
    onCellEditRequest: this.handleCellEditRequest.bind(this),
    getRowStyle: (params) => {
      if (params.data?.isPredicted) {
        return {
          background: 'rgba(226, 232, 240, .4)',
        };
      }
      return;
    },
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
