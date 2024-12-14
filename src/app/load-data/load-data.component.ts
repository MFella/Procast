import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-load-data',
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './load-data.component.html',
  styleUrl: './load-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoadDataComponent {}
