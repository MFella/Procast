import { inject, Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarConfig,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly defaultMatSnackBarConfig: MatSnackBarConfig = {
    duration: 5 * 1000,
  };

  constructor() {}

  showErrorSnackBar(
    message: string,
    action: string = 'Close',
    matSnackBarConfig: MatSnackBarConfig = this.defaultMatSnackBarConfig
  ): void {
    this.snackBar.open(message, action, matSnackBarConfig);
  }
}
