import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AbstractRestService } from '../_services/abstract-rest.service';
import { UserToCreateDto } from '../dtos/userToCreate.dto';
import { UserToLoginDto } from '../dtos/userToLogin.dto';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

export type JwtToken = {
  expiresIn: string;
  accessToken: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AbstractRestService {
  constructor(
    httpClient: HttpClient,
    private readonly socialAuthService: SocialAuthService
  ) {
    super(httpClient);
  }

  registerUser(userToCreateDto: UserToCreateDto): Observable<unknown> {
    return this.post('register', userToCreateDto);
  }

  loginUser(userToLoginDto: UserToLoginDto): Observable<JwtToken> {
    return this.post<JwtToken>('login', userToLoginDto).pipe(
      tap(this.setSession)
    );
  }

  checkEmail(email: string): Observable<boolean> {
    return this.get(`check-email?email=${email}`);
  }

  getDomainQuerySuffix(): string {
    return 'auth';
  }

  isUserLoggedIn(): boolean {
    return !!localStorage.getItem('jwtToken');
  }

  logout(): void {
    ['jwtToken', 'expiresAt'].forEach((key: string) =>
      localStorage.removeItem(key)
    );
  }

  observeOAuthStateChanged(): Observable<SocialUser> {
    return this.socialAuthService.authState;
  }

  private setSession(jwtToken: JwtToken): void {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(jwtToken.expiresIn));

    localStorage.setItem('jwtToken', jwtToken.accessToken);
    localStorage.setItem('expiresAt', JSON.stringify(expiresAt));
  }
}
