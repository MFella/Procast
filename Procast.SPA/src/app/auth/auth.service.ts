import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, Observable, switchMap, tap } from 'rxjs';
import { AbstractRestService } from '../_services/abstract-rest.service';
import { UserToCreateDto } from '../dtos/userToCreate.dto';
import { UserToLoginDto } from '../dtos/userToLogin.dto';
import {
  FacebookLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';

export type JwtToken = {
  expiresIn: string;
  accessToken: string;
};

type SocialProviders = 'GOOGLE' | 'FACEBOOK';

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

    if (localStorage.getItem('isSocial')) {
      this.socialAuthService.signOut();
      localStorage.removeItem('isSocial');
    }
  }

  observeOAuthStateChanged(): Observable<JwtToken> {
    return this.socialAuthService.authState.pipe(
      filter(Boolean),
      switchMap((socialUser: SocialUser) => this.loginSocialUser(socialUser))
    );
  }

  loginWithFacebook(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  private loginSocialUser(socialUser: SocialUser): Observable<JwtToken> {
    const { provider, firstName, lastName, email, idToken } = socialUser;
    const extractedIdToken: string = this.extractIdTokenByProvider(
      socialUser,
      socialUser.provider as SocialProviders
    );
    return this.post<JwtToken>('login-social', {
      provider,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      email,
      idToken: extractedIdToken,
    }).pipe(
      tap(this.setSession),
      tap(() => localStorage.setItem('isSocial', 'true'))
    );
  }

  private setSession(jwtToken: JwtToken): void {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(jwtToken.expiresIn));

    localStorage.setItem('jwtToken', jwtToken.accessToken);
    localStorage.setItem('expiresAt', JSON.stringify(expiresAt));
  }

  private extractIdTokenByProvider(
    socialUser: SocialUser,
    provider: SocialProviders
  ): string {
    switch (provider) {
      case 'GOOGLE':
        return socialUser.idToken;
      case 'FACEBOOK':
        return socialUser.authToken;
      default:
        throw new Error('Provider is not supported');
    }
  }
}
