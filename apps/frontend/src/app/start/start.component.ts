import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { loadSlim } from '@tsparticles/slim';
import { particlesConfig } from '../common/_particles/particles.config';
import { Container } from '@tsparticles/engine';

@Component({
  selector: 'app-start',
  imports: [RouterModule, NgxParticlesModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  standalone: true,
})
export class StartComponent implements OnInit {
  private ngParticlesService = inject(NgParticlesService);
  particlesConfig = particlesConfig;

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
