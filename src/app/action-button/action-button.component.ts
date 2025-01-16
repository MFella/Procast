import { Component, input } from '@angular/core';
import { ActionButtonConfig } from '../_typings/action-buttons/action-buttons.typings';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-action-button',
  imports: [NgClass],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
})
export class ActionButtonComponent {
  config = input.required<ActionButtonConfig>();
}
