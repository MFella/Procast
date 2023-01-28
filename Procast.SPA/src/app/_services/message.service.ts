import { Injectable } from '@angular/core';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import {TranslateService} from "@ngx-translate/core";
import {Single} from "../utils/single";
import {Observable} from "rxjs";

type NotifyEvent = 'success' | 'warning' | 'info' | 'failure';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private readonly translateService: TranslateService
  ) {
  }

  notify(translateKey: string, notifyEvent: NotifyEvent): void {
    this.selectTranslatedText(translateKey)
      .subscribe(Notify[notifyEvent]);
  }

  private selectTranslatedText(translateKey: string): Observable<string> {
    return Single.from(this.translateService.get(translateKey));
  }
}
