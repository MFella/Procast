import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AbstractRestService} from "../_services/abstract-rest.service";
import {UserToCreateDto} from "../dtos/userToCreate.dto";
import {UserToLoginDto} from "../dtos/userToLogin.dto";

export type JwtToken = {
  expiresIn: string;
  accessToken: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService extends AbstractRestService {

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  registerUser(userToCreateDto: UserToCreateDto): Observable<unknown> {
    return this.post('register', userToCreateDto);
  }

  loginUser(userToLoginDto: UserToLoginDto): Observable<JwtToken> {
    return this.post('login', userToLoginDto);
  }

  getDomainQuerySuffix(): string {
    return 'auth';
  }
}
