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
  selectedExternalFile = '';
  canLoadFile = false;
  parsedFile: Map<string, any> = new Map<string, any>();

  async loadFileFromLocalDestination($event: Event): Promise<void> {
    try {
      if (($event.target as unknown as HTMLInputElement).files) {
      }
      const parsedFile = await this.fileInteractionService.readAndParseFile(
        ($event.target as unknown as HTMLInputElement).files
      );

      if (parsedFile) {
        this.parsedFile = parsedFile;
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

    this.canLoadFile = this.selectedExternalFile !== '';
    this.isPredefinedDataVisible = !shouldHide;
    this.changeDetectorRef.detectChanges();
  }

  setSelectedFile(predefinedFileIndex: number, $event: any): void {
    const fileToSelect = this.predefinedFileList.find(
      (_, index) => predefinedFileIndex === index
    )![0];

    this.canLoadFile = this.selectedExternalFile !== fileToSelect;
    this.selectedExternalFile = this.canLoadFile ? fileToSelect : '';
    this.changeDetectorRef.detectChanges();
  }

  async loadFile(): Promise<void> {
    if (this.parsedFile?.size) {
      this.matDialogRef.close({
        event: 'success',
        data: { seriesData: this.parsedFile },
      });
      return;
    }

    if (this.selectedExternalFile) {
      const defaultFileContent =
        await this.restService.fetchDefaultFileContentFromAwsS3(
          this.selectedExternalFile
        );

      if (defaultFileContent?.size) {
        this.parsedFile = defaultFileContent;
        this.matDialogRef.close({
          event: 'success',
          data: { seriesData: this.parsedFile },
        });
      }
    }
  }
}
