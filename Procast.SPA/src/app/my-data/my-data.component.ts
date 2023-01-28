import { Component, OnInit } from '@angular/core';
import {ChartService} from "../_services/chart.service";

@Component({
  selector: 'pc-my-data',
  templateUrl: './my-data.component.html',
  styleUrls: ['./my-data.component.scss']
})
export class MyDataComponent implements OnInit {

  constructor(
    private readonly chartService: ChartService
  ) { }

  ngOnInit(): void {
    this.chartService.sayHi()
      .subscribe(() => console.log('should say hi'));
  }

}
