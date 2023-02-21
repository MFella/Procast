import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from './auth.service';
import { Single } from '../utils/single';
import { UserToCreateDto } from '../dtos/userToCreate.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from '../_services/message.service';
import { Router } from '@angular/router';
import { UserToLoginDto } from '../dtos/userToLogin.dto';
import { firstValueFrom, map, of, queue } from 'rxjs';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';

@Component({
  selector: 'pc-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  private static readonly EMAIL_PATTERN: string =
    '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  private static readonly PASSWORD_PATTERN: string =
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$';
  loginForm!: FormGroup<LoginFormControlTypes>;
  registerForm!: FormGroup<RegisterFormControlTypes>;

  passwordValidators: Array<ValidatorFn> = [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(64),
    Validators.pattern(AuthComponent.PASSWORD_PATTERN),
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.setForms();
    this.observeOAuthStateChanged();
  }

  isLoginFormInputInvalid(
    formControlName: keyof LoginFormControlTypes
  ): boolean {
    const formControl: AbstractControl | null =
      this.loginForm.get(formControlName);
    return (
      !formControl?.hasError('required') && !!formControl?.hasError('pattern')
    );
  }

  isRegisterFormInputInvalid(
    formControlName: keyof RegisterFormControlTypes
  ): boolean {
    const formControl: AbstractControl | null =
      this.registerForm.get(formControlName);
    return (
      !formControl?.hasError('required') &&
      Object.keys(formControl?.errors ?? {})?.length >= 1
    );
  }

  getPasswordViolations(): Array<string> {
    const passwordViolations: Array<string> = [];
    const passwordControl: AbstractControl | null =
      this.registerForm.get('password');
    const repeatPasswordControl: AbstractControl | null =
      this.registerForm.get('repeatPassword');

    if (
      passwordControl?.hasError('maxLength') ||
      repeatPasswordControl?.hasError('maxLength')
    ) {
      passwordViolations.push('is too long(max length is 64 signs)');
    }

    if (
      passwordControl?.hasError('minLength') ||
      repeatPasswordControl?.hasError('minLength')
    ) {
      passwordViolations.push('is too short(min length is 8 signs)');
    }

    if (
      passwordControl?.hasError('pattern') ||
      repeatPasswordControl?.hasError('pattern')
    ) {
      passwordViolations.push(
        'should contains at least one uppercase and lowercase letter, and one number'
      );
    }

    return passwordViolations;
  }

  submitRegisterUser(): void {
    const userToRegister = this.getUserToRegister();
    Single.from(this.authService.registerUser(userToRegister)).subscribe({
      next: () => {
        this.messageService.notify(
          'PC_AUTH_SIGN_UP_ACTION_SUCCESS_MESSAGE',
          'success'
        );
        this.router.navigate(['home']);
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.notify(error.error, 'failure');
      },
    });
  }

  submitLoginUser(): void {
    const userToLogin: UserToLoginDto = this.getUserToLogin();

    Single.from(this.authService.loginUser(userToLogin)).subscribe({
      next: () => {
        this.messageService.notify(
          'PC_AUTH_LOGIN_ACTION_SUCCESS_MESSAGE',
          'success'
        );
        this.router.navigate(['home']);
      },
      error: (_error: HttpErrorResponse) => {
        this.messageService.notify(
          'PC_AUTH_LOGIN_ACTION_ERROR_CREDS_NOT_MATCH_MESSAGE',
          'failure'
        );
      },
    });
  }

  getRegisterFormErrorTranslationKey(
    formControlName: keyof RegisterFormControlTypes
  ): Uppercase<string> {
    const formControl: AbstractControl | null =
      this.registerForm.get(formControlName);
    if (formControl?.hasError('pattern')) {
      return 'PC_AUTH_SIGN_UP_CONTAINER_EMAIL_PATTERN_ERROR_LABEL';
    }

    if (formControl?.hasError('emailExists')) {
      return 'PC_AUTH_SIGN_UP_CONTAINER_EMAIL_EXISTS_ERROR_LABEL';
    }

    return '';
  }

  private observeOAuthStateChanged(): void {
    this.authService
      .observeOAuthStateChanged()
      .subscribe((socialUser: SocialUser) => {
        console.log('received', socialUser);
      });
  }
  private setForms(): void {
    this.loginForm = this.formBuilder.group<LoginFormControlTypes>({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(AuthComponent.EMAIL_PATTERN),
      ]),
      password: new FormControl('', this.passwordValidators),
    });

    this.registerForm = this.formBuilder.group<RegisterFormControlTypes>(
      {
        name: new FormControl(''),
        surname: new FormControl(''),
        email: new FormControl(
          '',
          [Validators.pattern(AuthComponent.EMAIL_PATTERN)],
          this.isEmailExistsInDatabaseValidator.bind(this)
        ),
        password: new FormControl('', this.passwordValidators),
        repeatPassword: new FormControl('', this.passwordValidators),
      },
      { validators: [this.isPasswordsEqual()] }
    );
  }

  private isPasswordsEqual(): ValidatorFn {
    return (controls: AbstractControl): ValidationErrors | null => {
      const password: AbstractControl | null = controls.get('password');
      const repeatPassword: AbstractControl | null =
        controls.get('repeatPassword');

      return password?.value === repeatPassword?.value
        ? null
        : { notMatch: true };
    };
  }

  private getUserToRegister(): UserToCreateDto {
    let registerFormValue: RegisterTypes = this.registerForm.getRawValue();
    let key: keyof typeof registerFormValue;

    for (key in registerFormValue) {
      if (registerFormValue[key] === null) {
        registerFormValue[key] = '';
      }
    }

    return registerFormValue;
  }

  private getUserToLogin(): UserToLoginDto {
    let loginFormValue: LoginTypes = this.loginForm.getRawValue();

    let key: keyof typeof loginFormValue;

    for (key in loginFormValue) {
      if (loginFormValue[key] === null) {
        loginFormValue[key] = '';
      }
    }

    return loginFormValue;
  }

  private isEmailExistsInDatabaseValidator(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
    if (!new RegExp(AuthComponent.EMAIL_PATTERN).test(control.value)) {
      return Promise.resolve(null);
    }

    return firstValueFrom(
      this.authService
        .checkEmail(control?.getRawValue())
        .pipe(
          map((isEmailExistsInDatabase: boolean) =>
            isEmailExistsInDatabase ? { emailExists: true } : null
          )
        )
    );
  }
}

interface LoginFormControlTypes {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

interface LoginTypes {
  email: string | null;
  password: string | null;
}

interface RegisterFormControlTypes extends LoginFormControlTypes {
  name: FormControl<string | null>;
  surname: FormControl<string | null>;
  repeatPassword: FormControl<string | null>;
}

interface RegisterTypes extends LoginTypes {
  name: string | null;
  surname: string | null;
  repeatPassword: string | null;
}
