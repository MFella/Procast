import { Component, Input, OnInit } from '@angular/core';
import { Position } from './types/position';
import { SidebarSection } from './types/sidebarConfig';

@Component({
  selector: 'pc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input()
  position!: Position;

  @Input()
  sections!: Array<SidebarSection>;

  // @ContentChild('sectionTitleTemplateRef')
  // sectionTitleTemplateRef!: TemplateRef<unknown>;

  // @ContentChild('sectionOptionTemplateRef')
  // sectionOptionTemplateRef!: TemplateRef<unknown>;

  constructor() {}

  ngOnInit(): void {}
}
