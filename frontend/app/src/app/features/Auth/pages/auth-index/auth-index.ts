import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

import { BehaviorSubject, map, Subscription, tap } from 'rxjs';

import { CryptoService } from '../../../crypto/services/crypto.service';
import { AuthService } from '../../services/auth.service';

import { IAuthSignInDto, IAuthSignUpDto } from '../../interfaces/AuthDto';
import { IHttpErrorResponseDto } from '../../../../core/interfaces/http-error-response-dto';
import { PASSWORD_ENTRIES_PATHS } from '../../../password-entry/consts/routes.const';

@Component({
  selector: 'app-auth-index',
  imports: [ReactiveFormsModule, TitleCasePipe, AsyncPipe],
  templateUrl: './auth-index.html',
  styleUrl: './auth-index.css',
})
export class AuthIndex {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private cryptoService = inject(CryptoService);
  private router = inject(Router);

  private subscription: Subscription = new Subscription();

  private isSignIn = new BehaviorSubject<boolean>(false);
  isSignIn$ = this.isSignIn.asObservable();

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

  authSignInFormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    masterPassword: ['', Validators.required],
  });

  authSignUpFormGroup = this.formBuilder.group({
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
    this.isSignIn.next(!this.isSignIn.getValue());
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    const control = this.getFormControl();
    control.markAllAsTouched();
    if (control.invalid) {
      return;
    }

    return this.isSignIn.getValue() ? this.signIn() : await this.signUp();
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

  private handleServerErrors(err: IHttpErrorResponseDto) {
    const { errors } = err;

    if (!errors || !Object.keys(errors).length) {
      return;
    }

    Object.keys(errors).forEach((key) => {
      const fieldName = key;
      const errorValue = errors[key];
      const message = Array.isArray(errorValue) ? errorValue[0] : errorValue;

      const control = this.getFormControl().get(fieldName);
      if (control) {
        control.setErrors({ serverError: message });
        control.markAsTouched();
      }
    });
  }

  private getFormControl(): FormGroup {
    return this.isSignIn.getValue() ? this.authSignInFormGroup : this.authSignUpFormGroup;
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
    this.authService
      .signIn(signInDto)
      .pipe(
        tap(async (authRes) => {
          this.router.navigate(['/entries']);
        })
      )
      .subscribe({
        error: (err) => {
          this.handleServerErrors(err);
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

    // const masterPasswordSalt = this.cryptoService.generateSalt();
    // await this.cryptoService.deriveMasterEncryptionKey({
    //   masterPassword,
    //   salt: masterPasswordSalt,
    // });

    // const recoveryKey = this.cryptoService.generateRecoveryKey();

    // const { encrypted: encryptedMasterKeyWithRecovery, iv: recoveryIV } =
    //   await this.cryptoService.encryptMasterKeyWithRecovery(recoveryKey);

    // const masterPasswordSaltBase64 = this.cryptoService.arrayBufferToBase64(masterPasswordSalt);
    // const encryptedMasterKeyWithRecoveryBase64 = this.cryptoService.arrayBufferToBase64(
    //   encryptedMasterKeyWithRecovery
    // );
    // const recoveryIVBase64 = this.cryptoService.arrayBufferToBase64(recoveryIV);

    // const signUpDto: IAuthSignUpDto = {
    //   email,
    //   password,
    //   confirmPassword,
    //   username,
    //   masterPasswordSalt: masterPasswordSaltBase64,
    //   encryptedMasterKeyWithRecovery: encryptedMasterKeyWithRecoveryBase64,
    //   recoveryIV: recoveryIVBase64,
    // };
    (
      await this.authService.signUp({
        email,
        password,
        confirmPassword,
        username,
        masterPassword,
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/' + PASSWORD_ENTRIES_PATHS.passwordEntities]);
      },
      error: (err) => {
        this.handleServerErrors(err);
      },
    });

    return;
  }
}
