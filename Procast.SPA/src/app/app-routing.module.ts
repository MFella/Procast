import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {StartComponent} from "./start/start.component";
import {MyDataComponent} from "./my-data/my-data.component";
import {MyForecastsComponent} from "./my-forecasts/my-forecasts.component";
import {AuthComponent} from "./auth/auth.component";

const routes: Routes = [
  { path: 'home', component: StartComponent },
  { path: 'data', component: MyDataComponent },
  { path: 'forecasts', component: MyForecastsComponent },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
