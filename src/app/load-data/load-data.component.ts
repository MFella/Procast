import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FileReaderService } from '../_services/file-reader.service';
import { AlertService } from '../_services/alert.service';
import { TypeHelper } from '../_helpers/type-helper';

@Component({
  selector: 'app-load-data',
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './load-data.component.html',
  styleUrl: './load-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoadDataComponent {
  private fileReaderService = inject(FileReaderService);
  private readonly alertService = inject(AlertService);
  private readonly matDialogRef = inject(MatDialogRef);

  async loadFileFromLocalDestination($event: Event): Promise<void> {
    try {
      const parsedFile = await this.fileReaderService.readAndParseFile(
        ($event.target as unknown as HTMLInputElement).files
      );

      if (parsedFile) {
        this.matDialogRef.close({
          event: 'success',
          data: { seriesData: parsedFile },
        });
      } else {
        this.matDialogRef.close({
          event: 'fail',
          data: { message: 'Parsing of file failed' },
        });
      }
    } catch (error: unknown) {
      if (TypeHelper.isUnknownAnObject<'message'>(error)) {
        this.alertService.showErrorSnackBar(error.message);
      }
    }
  }
}
