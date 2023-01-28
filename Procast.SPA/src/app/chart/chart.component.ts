import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2, ViewChild
} from '@angular/core';
import {Chart, ChartConfiguration} from "chart.js";
import {ChartService} from "../_services/chart.service";

@Component({
  selector: 'pc-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('chartContainer', { read: ElementRef })
  chartContainer!: ElementRef;

  @Input()
  chartName: string = '';

  @Input()
  chartConfiguration!: ChartConfiguration;

  @Input()
  height!: string;

  @Input()
  width!: string;

  public chart!: Chart | null;

  constructor(
    private readonly renderer: Renderer2
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
      this.setChart(this.chartName, this.chartConfiguration);
      this.setStyle();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
  //
  // private setChart(): void {
  //   queueMicrotask(() => {
  //     return new Chart(this.type, {
  //       type: this.type,
  //       data: this.data,
  //       options: this.options
  //     });
  //   });
  // }

  private setChart(chartName: string, chartConfiguration: ChartConfiguration): void {
    this.chart = new Chart(chartName, chartConfiguration);
  }

  private setStyle(): void {
    this.renderer.setStyle(this.chartContainer.nativeElement, 'width', this.width);
    this.renderer.setStyle(this.chartContainer.nativeElement, 'height', this.height);
  }

}
