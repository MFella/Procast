import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarManagerService {
  private optionClicked$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  private sectionIdToOptionIdsMap: Map<string, Array<string>> = new Map<
    string,
    Array<string>
  >();

  constructor() {}

  emitOptionClicked(optionId: string): void {
    this.optionClicked$.next(optionId);
  }

  observeOptionClicked(sectionId: string): Observable<string> {
    return this.optionClicked$
      .asObservable()
      .pipe(
        filter(
          (optionId: string) =>
            !!this.sectionIdToOptionIdsMap.get(sectionId)?.includes(optionId)
        )
      );
  }

  saveSectionIdToOptions(sectionId: string, optionIds: Array<string>): void {
    this.sectionIdToOptionIdsMap.set(sectionId, optionIds);
  }
}
