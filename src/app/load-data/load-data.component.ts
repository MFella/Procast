import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FileInteractionService } from '../_services/file-interaction.service';
import { AlertService } from '../_services/alert.service';
import { TypeHelper } from '../_helpers/type-helper';
import { RestService } from '../_services/rest.service';
import { NgClass } from '@angular/common';
import { DisplayPredefinedFile } from '../_typings/workspace/load-data.typings';

@Component({
  selector: 'app-load-data',
  imports: [MatButtonModule, MatIconModule, MatDialogModule, NgClass],
  templateUrl: './load-data.component.html',
  styleUrl: './load-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoadDataComponent {
  private readonly fileInteractionService = inject(FileInteractionService);
  private readonly alertService = inject(AlertService);
  private readonly matDialogRef = inject(MatDialogRef);
  private readonly restService = inject(RestService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  isPredefinedDataVisible = false;
  predefinedFileList: Array<DisplayPredefinedFile> = [];
  selectedFile = '';
  canLoadFile = false;

  async loadFileFromLocalDestination($event: Event): Promise<void> {
    try {
      const parsedFile = await this.fileInteractionService.readAndParseFile(
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

  async togglePredefinedData(shouldHide: boolean = false): Promise<void> {
    if (shouldHide) {
      this.isPredefinedDataVisible = !shouldHide;
      this.canLoadFile = false;
    } else if (!this.predefinedFileList?.length) {
      const fileList = await this.restService.fetchFileListFromAwsS3();
      if (fileList.Contents?.length) {
        this.predefinedFileList = fileList.Contents.map((content) => [
          content.Key?.split('-').slice(5).join('-'),
          content.Key?.split('.')?.at(-1),
        ]).filter((arr) => arr[0] !== undefined) as Array<[string, string]>;
      }
    }

    this.canLoadFile = this.selectedFile !== '';
    this.isPredefinedDataVisible = !shouldHide;
    this.changeDetectorRef.detectChanges();
  }

  setSelectedFile(predefinedFileIndex: number, $event: any): void {
    const fileToSelect = this.predefinedFileList.find(
      (_, index) => predefinedFileIndex === index
    )![0];

    this.canLoadFile = this.selectedFile !== fileToSelect;
    this.selectedFile = this.canLoadFile ? fileToSelect : '';
    this.changeDetectorRef.detectChanges();
  }
}
