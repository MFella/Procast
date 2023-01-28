import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AbstractRestService} from "./abstract-rest.service";

@Injectable({
  providedIn: 'root'
})
export class ChartService extends AbstractRestService {

  constructor(httpService: HttpClient) {
    super(httpService);
  }

  // apply Decorator with hardcoded extra path
  sayHi(extraPath?: string): Observable<void> {
    return this.get<void>(extraPath);
  }

  getDomainQuerySuffix(): string {
    return 'chart';
  }
}
