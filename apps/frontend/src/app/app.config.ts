import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { seriesDataReducer } from './architecture/reducers/series-data.reducers';
import { sidebarConfigReducer } from './architecture/reducers/sidebar-config.reducers';
import { provideHttpClient } from '@angular/common/http';
import { GrpcCoreModule } from '@ngx-grpc/core';
import { GrpcWebClientModule } from '@ngx-grpc/grpc-web-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      seriesData: seriesDataReducer,
      sidebarConfig: sidebarConfigReducer,
    }),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideClientHydration(withEventReplay()),
    provideCharts(withDefaultRegisterables()),
    provideAnimationsAsync(),
    importProvidersFrom(
      GrpcCoreModule.forRoot(),
      GrpcWebClientModule.forRoot({
        settings: { host: 'http://localhost:8080' },
      })
    ),
  ],
};
