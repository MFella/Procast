import { Component, inject, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { RouterModule } from '@angular/router';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { loadSlim } from '@tsparticles/slim';
import { particlesConfig } from '../common/_particles/particles.config';
import { Container } from '@tsparticles/engine';

@Component({
  selector: 'app-start',
  imports: [RouterModule, BaseChartDirective, NgxParticlesModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  standalone: true,
})
export class StartComponent implements OnInit {
  private ngParticlesService = inject(NgParticlesService);
  particlesConfig = particlesConfig;

  private skipped = (ctx: any, value: any) =>
    ctx.p0.skip || ctx.p1.skip ? value : undefined;
  private down = (ctx: any, value: any) =>
    ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        data: [65, 59, NaN, 81, 56, NaN, 72],
        label: 'Series A',
        fill: true,
        tension: 0.5,
        borderColor: 'blue',
        segment: {
          // borderColor: (ctx) =>
          //   this.skipped(ctx, 'rgb(0,0,0,0.2)') ||
          //   this.down(ctx, 'rgb(192,75,75)'),
          borderDash: (ctx) => this.skipped(ctx, [6, 6]),
        },
        spanGaps: true,
        backgroundColor: 'rgba(224, 242, 254, .6)',
      },
    ],
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    // aspectRatio: 1,
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 1,
        to: 0,
        loop: true,
      },
    },
  };
  public lineChartLegend = true;

  ngOnInit(): void {
    this.loadNgParticlesEngine();
  }

  private loadNgParticlesEngine(): void {
    this.ngParticlesService.init(async (engine) => {
      console.log(engine);

      // Starting from 1.19.0 you can add custom presets or shape here, using the current tsParticles instance (main)
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadFull(engine);
      await loadSlim(engine);
    });
  }

  particlesLoaded(container: Container): void {
    console.log(container);
  }
}
