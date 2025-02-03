import { Routes } from '@angular/router';
import { cachedTrainConfigResolver } from './_resolvers/cached-train-config.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./start/start.component').then((module) => module.StartComponent),
  },
  {
    path: 'workspace',
    loadComponent: () =>
      import('./workspace/workspace.component').then(
        (module) => module.WorkspaceComponent
      ),
    resolve: {
      cachedTrainConfig: cachedTrainConfigResolver,
    },
  },
];
