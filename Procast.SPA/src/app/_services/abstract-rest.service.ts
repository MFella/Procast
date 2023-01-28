import { Injectable } from '@angular/core';
import {HttpClient, HttpContext, HttpHeaders, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractRestService {

  constructor(protected readonly httpClient: HttpClient) { }

  abstract getDomainQuerySuffix(): string;

  protected get<T>(extraPath: string = '', options?: HttpOptions): Observable<T> {
    return this.httpClient.get<T>(this.getRestUrl() + extraPath, options);
  }

  protected post<T>(extraPath: string = '', body : any | null, options?: HttpOptions): Observable<T> {
    return this.httpClient.post<T>(this.getRestUrl() + extraPath, body, options);
  }

  private getRestUrl(): string {
    return  environment.backendUrl + '/' + this.getDomainQuerySuffix() + '/';
  }
}

type HttpOptions = {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
};
