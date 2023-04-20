import { ReplaySubject } from 'rxjs';

export class Storage<T> {
  valueChanged$: ReplaySubject<T> = new ReplaySubject(1);

  set(value: T): void {
    this.valueChanged$.next(value);
  }

  clear(): void {
    this.valueChanged$.unsubscribe();
    this.valueChanged$.complete();
  }
}
