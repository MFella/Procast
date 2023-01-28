import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { NavComponent } from './nav/nav.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { StartComponent } from './start/start.component';
import { MyDataComponent } from './my-data/my-data.component';
import { MyForecastsComponent } from './my-forecasts/my-forecasts.component';
import { AuthComponent } from './auth/auth.component';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {ReactiveFormsModule} from "@angular/forms";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    NavComponent,
    StartComponent,
    MyDataComponent,
    MyForecastsComponent,
    AuthComponent
  ],
  imports: [
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
        deps: [HttpClient]
      }
    }),
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    TranslateModule
  ]
})
export class AppModule { }
