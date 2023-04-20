import {
  SidebarConfig,
  SidebarSection,
} from './../generics/display/sidebar/types/sidebarConfig';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Single } from '../utils/behavior/single';
import { ChartService } from '../_services/chart.service';

@Component({
  selector: 'pc-my-data',
  templateUrl: './my-data.component.html',
  styleUrls: ['./my-data.component.scss'],
})
export class MyDataComponent implements OnInit {
  sidebarConfig!: SidebarConfig;

  constructor(
    private readonly chartService: ChartService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    Single.from(this.activatedRoute.data).subscribe(
      (response: { sidebarConfig: SidebarConfig }) => {
        this.sidebarConfig = response.sidebarConfig;
      }
    );

    this.chartService.sayHi().subscribe(() => console.log('should say hi'));
  }
}
