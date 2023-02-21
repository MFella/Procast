import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../auth/auth.service";
import {MessageService} from "../_services/message.service";

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Uppercase<P1>}_${Uppercase<P2>}${CamelCase<P3>}`
  : Uppercase<S>;

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const expiresAt: string | null = localStorage.getItem('expiresAt');

    if (!expiresAt) {
      return false;
    }

    if (new Date().getTime() >= new Date(expiresAt).getTime()) {
      //TODO request refresh token
      this.authService.logout();
      this.messageService.notify('PC_AUTH_LOGOUT_INFO_MESSAGE', 'info');
      return false;
    }

    return true;
  }

}
