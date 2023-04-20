import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StartComponent } from './start/start.component';
import { MyDataComponent } from './my-data/my-data.component';
import { MyForecastsComponent } from './my-forecasts/my-forecasts.component';
import { AuthComponent } from './auth/auth.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './_interceptors/auth.interceptor';
import { MatExpansionModule } from '@angular/material/expansion';
import { StoreModule } from '@ngrx/store';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
} from '@abacritt/angularx-social-login';
import { MatTreeModule } from '@angular/material/tree';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';
import { SidebarSectionComponent } from './generics/display/sidebar-section/sidebar-section.component';
import { SidebarComponent } from './generics/display/sidebar/sidebar.component';
import { MatTreeManager } from './utils/structural/tree/matTreeManager';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const googleOauthPayload = {
  clientId:
    '187695350870-ar0g3ng5fvum5k58vt5tc2s72h3lu4lf.apps.googleusercontent.com',
  clientSecret: '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',
  callbackUrl: 'http://localhost:4200/home',
  scopes: ['profile', 'email'],
};

const facebookOauthPayload = {
  appId: '755899472536049',
  appSecret: '3f808f589ce6a701fb1a140a9debae51',
};

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    NavComponent,
    StartComponent,
    MyDataComponent,
    MyForecastsComponent,
    AuthComponent,
    SidebarComponent,
    SidebarSectionComponent,
  ],
  imports: [
    SocialLoginModule,
    BrowserModule,
    HttpClientModule,
    MatIconModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatTreeModule,
    StoreModule.forRoot({}, {}),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(googleOauthPayload.clientId),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(facebookOauthPayload.appId),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    MatTreeManager,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [TranslateModule],
})
export class AppModule {}
