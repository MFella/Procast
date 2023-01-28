import {Component, OnInit} from '@angular/core';
import {Chart, ChartConfiguration, registerables} from "chart.js";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'pc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private static readonly DEFAULT_APPLICATION_LANGUAGE = 'en';
  title = 'Procast.SPA';

  chartName: string = '';

  chartConfiguration!: ChartConfiguration;

  width: string = '500px';

  constructor(private readonly translateService: TranslateService) {
    translateService.setDefaultLang(AppComponent.DEFAULT_APPLICATION_LANGUAGE);

    translateService.use(AppComponent.DEFAULT_APPLICATION_LANGUAGE);
  }

  ngOnInit(): void {
    this.chartName = 'ChartName';
    this.chartConfiguration = this.createChartConfiguration();
    Chart.register(...registerables);
  }

  private createChartConfiguration(): ChartConfiguration {
    return {
      type: 'bar', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: ['2022-05-10', '2022-05-11', '2022-05-12','2022-05-13',
          '2022-05-14', '2022-05-15', '2022-05-16','2022-05-17', ],
        datasets: [
          {
            label: "Sales",
            data: [467, 576, 572, 79, 92,
              574, 573, 576],
            backgroundColor: 'blue'
          },
          {
            label: "Profit",
            data: [542, 542, 536, 327, 17,
              0.00, 538, 541],
            backgroundColor: 'limegreen'
          }
        ]
      },
      options: {
        aspectRatio:2.5
      }
    };
  }
}
