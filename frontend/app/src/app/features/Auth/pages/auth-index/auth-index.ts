import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

import { BehaviorSubject, map, Subscription, tap } from 'rxjs';

import { AuthHttpService } from '../../services/auth-http-service';
import { ErrorService } from '../../../../core/services/error-service';

import { RecoveryPasswordDialogService } from '../../../master-password/services/recovery-password-dialog';
import { ConfirmationDialogService } from '../../../../core/dialogs/confirmation-dialog/services/confirmation-dialog-service';

import { PASSWORD_ENTRIES_PATHS } from '../../../password-entry/consts/password-entry-routes.const';
import { AUTH_PATHS } from '../../consts/auth-routes.const';

import type { IAuthSignInDto, IAuthSignUpDto } from '../../interfaces/auth.interface';
import { SETTINGS_PATHS } from '../../../settings/const/settings-routes.const';

@Component({
  selector: 'app-auth-index',
  imports: [ReactiveFormsModule, TitleCasePipe, AsyncPipe],
  templateUrl: './auth-index.html',
  styleUrl: './auth-index.css',
})
export class AuthIndex {
  #authHttpService = inject(AuthHttpService);
  #formBuilder = inject(FormBuilder);
  #router = inject(Router);
  #errorService = inject(ErrorService);
  #recoveryPasswordDialogService = inject(RecoveryPasswordDialogService);
  #confirmationDialogService = inject(ConfirmationDialogService);

  #subscription: Subscription = new Subscription();

  #isSignIn = new BehaviorSubject<boolean>(true);
  public isSignIn$ = this.#isSignIn.asObservable();

  readonly signInInputs = [
    {
      labelText: 'Email',
      formControlName: 'email',
      type: 'email',
      placeHolder: 'Email',
    },

    {
      labelText: 'Password',
      formControlName: 'password',
      type: 'password',
      placeHolder: 'Password',
    },
  ];

  readonly signUpInputs = [
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

  readonly masterPasswordInput = {
    labelText: 'Master Password',
    formControlName: 'masterPassword',
    type: 'password',
    placeHolder: 'Master Password',
  };

  authSignInFormGroup = this.#formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    masterPassword: ['', Validators.required],
  });

  authSignUpFormGroup = this.#formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
    masterPassword: ['', Validators.required],
  });

  authSettings$ = this.isSignIn$.pipe(
    map((isSignIn) => {
      if (isSignIn) {
        if (!this.signInInputs.includes(this.masterPasswordInput)) {
          this.signInInputs.push(this.masterPasswordInput);
        }
        return {
          headerText: 'Sign-In',
          footerText: "Don't have an account? Sign Up",
          formGroup: this.authSignInFormGroup,
          inputs: this.signInInputs,
          isSignIn: true,
        };
      }
      if (!this.signUpInputs.includes(this.masterPasswordInput)) {
        this.signUpInputs.push(this.masterPasswordInput);
      }
      return {
        headerText: 'Sign Up',
        footerText: 'Already have an account? Sign In',
        formGroup: this.authSignUpFormGroup,
        inputs: this.signUpInputs,
        isSignIn: false,
      };
    })
  );

  toggleAuthMode() {
    this.#isSignIn.next(!this.#isSignIn.getValue());
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    const control = this.#getFormControl();
    control.markAllAsTouched();
    if (control.invalid) {
      return;
    }

    return this.#isSignIn.getValue() ? this.#signIn() : await this.#signUp();
  }

  getErrorMessage(controlName: string, label: string): string {
    //INFO: Form group ambiguity using 'as' to solve
    const control = (this.#getFormControl() as FormGroup).get(controlName);

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
    this.#subscription.unsubscribe();
  }

  #getFormControl(): FormGroup {
    return this.#isSignIn.getValue() ? this.authSignInFormGroup : this.authSignUpFormGroup;
  }

  #signIn() {
    const { email, password, masterPassword } = this.authSignInFormGroup.value;
    if (!email || !password || !masterPassword) {
      console.warn(
        'Email, Password or Master Password are missing and skipped validation, this should not happen.'
      );
      return;
    }
    const signInDto: IAuthSignInDto = { email: email, password: password };
    this.#authHttpService
      .signIn(signInDto)
      .pipe(
        tap(async () => {
          this.#router.navigate(['/entries']);
        })
      )
      .subscribe({
        error: (err) => {
          this.#errorService.handleError(err, {
            formGroup: this.authSignInFormGroup,
            showToast: false,
          });
        },
      });
    return;
  }

  async #signUp() {
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

    const subscription = await this.#authHttpService.signUp(signUpDto);

    subscription.subscribe({
      next: async (res) => {
        console.log('🚀 ~ AuthIndex ~ res:', res);
        await this.#recoveryPasswordDialogService.openDialog({ recoveryKey: res.recoveryKey });

        const isNavToSettings = await this.#confirmationDialogService.openDialog({
          title: 'Navigate to Settings',
          message: 'Do you want to navigate to settings to review your account settings?',
        });

        const dest = isNavToSettings
          ? ['/', SETTINGS_PATHS.settingsIndex]
          : ['/', PASSWORD_ENTRIES_PATHS.passwordEntries];

        this.#router.navigate(dest);
      },
      error: (err) => {
        this.#errorService.handleError(err, {
          formGroup: this.authSignUpFormGroup,
          showToast: true,
        });
      },
    });

    return;
  }
}
