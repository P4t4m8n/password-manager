import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

import { BehaviorSubject, map, Subscription, tap } from 'rxjs';

import { CryptoService } from '../../../crypto/services/crypto.service';
import { AuthService } from '../../services/auth.service';

import { PASSWORD_ENTRIES_PATHS } from '../../../password-entry/consts/routes.const';

import type { IAuthSignInDto, IAuthSignUpDto } from '../../interfaces/AuthDto';
import type { IHttpErrorResponseDto } from '../../../../core/interfaces/http-error-response-dto';
import { ErrorService } from '../../../../core/services/error-service';

@Component({
  selector: 'app-auth-index',
  imports: [ReactiveFormsModule, TitleCasePipe, AsyncPipe],
  templateUrl: './auth-index.html',
  styleUrl: './auth-index.css',
})
export class AuthIndex {
  private _authService = inject(AuthService);
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _errorService = inject(ErrorService);

  private subscription: Subscription = new Subscription();

  private _isSignIn = new BehaviorSubject<boolean>(true);
  public isSignIn$ = this._isSignIn.asObservable();

  signInInputs = [
    {
      labelText: 'Email',
      formControlName: 'email',
      type: 'email',
      placeHolder: 'Email',
    },
    {
      labelText: 'Master Password',
      formControlName: 'masterPassword',
      type: 'password',
      placeHolder: 'Master Password',
    },
    {
      labelText: 'Password',
      formControlName: 'password',
      type: 'password',
      placeHolder: 'Password',
    },
  ];

  signUpInputs = [
    {
      labelText: 'Username',
      formControlName: 'username',
      type: 'text',
      placeHolder: 'Username',
    },
    ...this.signInInputs,
    {
      labelText: 'Confirm Password',
      formControlName: 'confirmPassword',
      type: 'password',
      placeHolder: 'Confirm Password',
    },
  ];

  authSignInFormGroup = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    masterPassword: ['', Validators.required],
  });

  authSignUpFormGroup = this._formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
    masterPassword: ['', Validators.required],
  });

  authSettings$ = this.isSignIn$.pipe(
    map((isSignIn) => {
      if (isSignIn) {
        return {
          headerText: 'Sign-In',
          footerText: "Don't have an account? Sign Up",
          formGroup: this.authSignInFormGroup,
          inputs: this.signInInputs,
        };
      }
      return {
        headerText: 'Sign Up',
        footerText: 'Already have an account? Sign In',
        formGroup: this.authSignUpFormGroup,
        inputs: this.signUpInputs,
      };
    })
  );

  toggleAuthMode() {
    this._isSignIn.next(!this._isSignIn.getValue());
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    const control = this.getFormControl();
    control.markAllAsTouched();
    if (control.invalid) {
      return;
    }

    return this._isSignIn.getValue() ? this.signIn() : await this.signUp();
  }

  getErrorMessage(controlName: string, label: string): string {
    //INFO: Form group ambiguity using as to solve
    const control = (this.getFormControl() as FormGroup).get(controlName);

    if (control?.errors?.['serverError']) {
      return control.errors['serverError'];
    }

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${label} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }

    return '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getFormControl(): FormGroup {
    return this._isSignIn.getValue() ? this.authSignInFormGroup : this.authSignUpFormGroup;
  }

  private signIn() {
    const { email, password, masterPassword } = this.authSignInFormGroup.value;
    if (!email || !password || !masterPassword) {
      console.warn(
        'Email, Password or Master Password are missing and skipped validation, this should not happen.'
      );
      return;
    }
    const signInDto: IAuthSignInDto = { email: email, password: password };
    this._authService
      .signIn(signInDto)
      .pipe(
        tap(async (authRes) => {
          this._router.navigate(['/entries']);
        })
      )
      .subscribe({
        error: (err) => {
          this._errorService.handleError(err, {
            formGroup: this.authSignInFormGroup,
            showToast: true,
          });
        },
      });
    return;
  }

  private async signUp() {
    const { email, password, confirmPassword, username, masterPassword } =
      this.authSignUpFormGroup.value;
    if (!email || !password || !confirmPassword || !username || !masterPassword) {
      console.warn(
        'Email, Password or Confirm Password are missing and skipped validation, this should not happen.'
      );
      return;
    }

    const signUpDto: IAuthSignUpDto & { masterPassword: string } = {
      email,
      password,
      confirmPassword,
      username,
      masterPassword,
    };

    (await this._authService.signUp(signUpDto)).subscribe({
      next: () => {
        this._router.navigate(['/' + PASSWORD_ENTRIES_PATHS.passwordEntities]);
      },
      error: (err) => {
        this._errorService.handleError(err, {
          formGroup: this.authSignUpFormGroup,
          showToast: true,
        });
      },
    });

    return;
  }
}
