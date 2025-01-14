import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-generic-modal',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgTemplateOutlet,
  ],
  templateUrl: './generic-modal.component.html',
  styleUrl: './generic-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GenericModalComponent implements OnInit {
  private readonly matDialogData = inject(MAT_DIALOG_DATA, { optional: true });

  changeDetectorRef = inject(ChangeDetectorRef);
  templateRef?: TemplateRef<any>;

  ngOnInit(): void {
    this.templateRef = this.matDialogData?.templateRef;
    this.changeDetectorRef.detectChanges();
  }
}
