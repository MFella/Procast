import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxParticlesModule } from '@tsparticles/angular';
import { particlesConfig } from '../common/_particles/particles.config';

@Component({
  selector: 'app-start',
  imports: [RouterModule, NgxParticlesModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.scss',
  standalone: true,
})
export class StartComponent {
  particlesConfig = particlesConfig;
}
