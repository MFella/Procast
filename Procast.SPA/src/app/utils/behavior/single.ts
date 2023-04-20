import {Observable, OperatorFunction, take} from "rxjs";

export class Single<T> {

  static from(source$: Observable<any>): Observable<any> {
    return source$.pipe(take(1));
  }
}
