import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

import { BehaviorSubject, map, Subscription, tap } from 'rxjs';

import { AuthHttpService } from '../../services/auth-http-service';
import { ErrorService } from '../../../../core/services/error-service';

import { RecoveryPasswordDialogService } from '../../../master-password/services/recovery-password-dialog';
import { ConfirmationDialogService } from '../../../../core/dialogs/confirmation-dialog/services/confirmation-dialog-service';
import { MasterPasswordDialogService } from '../../../master-password/services/master-password-dialog-service';
import { MasterPasswordHttpService } from '../../../master-password/services/master-password-http-service';
import { CryptoService } from '../../../crypto/services/crypto-service';

import { PASSWORD_ENTRIES_PATHS } from '../../../password-entry/consts/password-entry-routes.const';

import type { IAuthProps, IAuthSignInDto, IAuthSignUpDto } from '../../interfaces/auth.interface';
import { SETTINGS_PATHS } from '../../../settings/const/settings-routes.const';
import { SubmitButton } from '../../../../core/components/submit-button/submit-button';
import { LoadingService } from '../../../../core/services/loading-service';

@Component({
  selector: 'app-auth-index',
  imports: [ReactiveFormsModule, AsyncPipe, SubmitButton],
  templateUrl: './auth-index.html',
  styleUrl: './auth-index.css',
  providers: [LoadingService],
})
export class AuthIndex {
  #authHttpService = inject(AuthHttpService);
  #formBuilder = inject(FormBuilder);
  #router = inject(Router);
  #errorService = inject(ErrorService);
  #recoveryPasswordDialogService = inject(RecoveryPasswordDialogService);
  #confirmationDialogService = inject(ConfirmationDialogService);
  #masterPasswordDialogService = inject(MasterPasswordDialogService);
  #masterPasswordHttpService = inject(MasterPasswordHttpService);
  #cryptoService = inject(CryptoService);
  #loadingService = inject(LoadingService);

  #isSignIn = new BehaviorSubject<boolean>(true);
  public isSignIn$ = this.#isSignIn.asObservable();

  public isSaving$ = this.#loadingService.isSaving$;

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

  // readonly masterPasswordInput = {
  //   labelText: 'Master Password',
  //   formControlName: 'masterPassword',
  //   type: 'password',
  //   placeHolder: 'Master Password',
  // };

  authSignInFormGroup = this.#formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  authSignUpFormGroup = this.#formBuilder.group(
    {
      username: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  authSettings$ = this.isSignIn$.pipe(
    map((isSignIn) => {
      console.log('isSignIn', isSignIn);
      if (isSignIn) {
        // if (!this.signInInputs.includes(this.masterPasswordInput)) {
        //   this.signInInputs.push(this.masterPasswordInput);
        // }
        return {
          headerText: 'Sign-In',
          loadingText: 'Signing In...',
          footerText: "Don't have an account? Sign Up",
          formGroup: this.authSignInFormGroup,
          inputs: this.signInInputs,
          isSignIn: true,
        };
      }
      return {
        headerText: 'Sign Up',
        loadingText: 'Signing Up...',
        footerText: 'Already have an account? Sign In',
        formGroup: this.authSignUpFormGroup,
        inputs: this.signUpInputs,
        isSignIn: false,
      };
    }),
  );

  toggleAuthMode() {
    this.#isSignIn.next(!this.#isSignIn.getValue());
    console.log(
      '🚀 ~ AuthIndex ~ toggleAuthMode ~ this.#isSignIn.getValue():',
      this.#isSignIn.getValue(),
    );
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    const control = this.#getFormControl();
    console.log('🚀 ~ AuthIndex ~ onSubmit ~ control:', control);

    control.markAllAsTouched();
    console.log('Submitting form');
    if (control.invalid) {
      return;
    }

    return this.#isSignIn.getValue() ? this.#signIn() : this.#signUp();
  }

  getErrorMessage(controlName: string, label: string): string {
    //INFO: Form group ambiguity using 'as' to solve
    const group = this.#getFormControl() as FormGroup;
    const control = group.get(controlName);

    if (control?.errors?.['serverError']) {
      return control.errors['serverError'];
    }

    if (controlName === 'confirmPassword' && group.hasError('passwordMismatch')) {
      return 'Passwords do not match';
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

    if (control.errors['maxlength']) {
      return `${label} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    }

    return '';
  }

  ngOnDestroy() {}

  #getFormControl(): FormGroup {
    console.log('🚀 ~ AuthIndex ~ this.#isSignIn.getValue():', this.#isSignIn.getValue());
    return this.#isSignIn.getValue() ? this.authSignInFormGroup : this.authSignUpFormGroup;
  }

  #signIn() {
    const { email, password } = this.authSignInFormGroup.value;
    if (!email || !password) {
      console.warn(
        'Email, Password or Master Password are missing and skipped validation, this should not happen.',
      );
      return;
    }

    const signInDto: IAuthProps<IAuthSignInDto> = {
      email: email.trim(),
      password: password,
    };

    this.#loadingService.setSaving(true);

    this.#authHttpService
      .signIn(signInDto)
      .pipe(
        tap(async (res) => {
          // const { masterPasswordVerification, masterPasswordVerificationIV } = res.data;

          // if (masterPasswordVerification && masterPasswordVerificationIV) {
          //   const isValid = await this.#cryptoService.verifyMasterPassword(
          //     masterPasswordVerification,
          //     masterPasswordVerificationIV,
          //   );
          //   console.log("🚀 ~ AuthIndex ~ tap ~ isValid:", isValid)

          //   if (!isValid) {
          //     this.authSignInFormGroup.get('masterPassword')?.setErrors({
          //       serverError: 'Incorrect master password',
          //     });
          //     this.#loadingService.setSaving(false);
          //     return;
          //   }
          // }
          const masterPassword = await this.#masterPasswordDialogService.openDialog({
            mode: 'unlock',
          });
          console.log("🚀 ~ AuthIndex ~ masterPassword:", masterPassword)

          this.#router.navigate(['/entries']);
        }),
      )
      .subscribe({
        error: (err) => {
          this.#errorService.handleError(err, {
            formGroup: this.authSignInFormGroup,
            showToast: true,
          });
          this.#loadingService.setSaving(false);
        },
        complete: () => {
          this.#loadingService.setSaving(false);
        },
      });
    return;
  }

  #signUp() {
    const { email, password, confirmPassword, username } = this.authSignUpFormGroup.value;

    if (!email || !password || !confirmPassword || !username) {
      console.warn(
        'Email, Password or Confirm Password are missing and skipped validation, this should not happen.',
      );
      return;
    }

    const signUpDto: IAuthSignUpDto = {
      email: email.trim(),
      password,
      confirmPassword,
      username: username.trim(),
    };

    this.#loadingService.setSaving(true);

    this.#authHttpService.signUp(signUpDto).subscribe({
      next: async () => {
        this.#loadingService.setSaving(false);

        const masterPassword = await this.#masterPasswordDialogService.openDialog({
          mode: 'setup',
        });

        if (!masterPassword) return;

        const credentials = await this.#cryptoService.handleMasterPasswordCreation(masterPassword);

        await this.#masterPasswordHttpService.setupMasterPassword({
          masterPasswordSalt: credentials.masterPasswordSalt,
          encryptedMasterKeyWithRecovery: credentials.encryptedMasterKeyWithRecovery,
          recoveryIV: credentials.recoveryIV,
          masterPasswordVerification: credentials.masterPasswordVerification,
          masterPasswordVerificationIV: credentials.masterPasswordVerificationIV,
        });

        await this.#cryptoService.persistMasterPassword(masterPassword);
        await this.#recoveryPasswordDialogService.openDialog({
          recoveryKey: credentials.recoveryKey,
        });

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
        this.#loadingService.setSaving(false);
      },
    });

    return;
  }
}

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};
