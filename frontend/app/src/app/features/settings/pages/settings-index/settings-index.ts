import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserSettingsHttpService } from '../../services/user-settings-http-service';
import { ErrorService } from '../../../../core/services/error-service';

import { Header } from '../../../../core/layout/header/header';

import { STORGE_MODES, THEMES } from '../../const/user-settings.const';
import { PASSWORD_STRENGTH_LEVELS } from '../../../crypto/const/password.const';

import type { TPasswordStrength } from '../../../password-generator/types/password-generator.type';
import type { TStorageMode, TTheme } from '../../types/settings.type';
import type { IUserSettingsEditDTO } from '../../interfaces/IUserSettingsDTO';

type TRadioMapKey = TPasswordStrength | TTheme | TStorageMode;

@Component({
  selector: 'app-settings-index',
  imports: [Header, ReactiveFormsModule],
  templateUrl: './settings-index.html',
  styleUrl: './settings-index.css',
})
export class SettingsIndex {
  #formBuilder = inject(FormBuilder);
  #userSettingsHttpService = inject(UserSettingsHttpService);
  #errorService = inject(ErrorService);

  readonly #RADIO_TEST_MAP: Record<TRadioMapKey, string> = {
    weak: 'Not recommended',
    medium: 'Acceptable for low risk accounts',
    strong: 'Recommended for most accounts',
    'very-strong': 'Best for high risk accounts',
    light: ' Bright and clear appearance',
    dark: 'Easy on the eyes in low light',
    system: 'Matches your device settings',
    none: 'Do not store - You will need to enter your master password each session - Highly secure and recommended',
    session:
      'Store for session - Master password will be stored until you log out or close the browser.',
    local:
      'Remember me - Master password will be stored across sessions - not secure and not recommended',
  };

  readonly MASTER_PASSWORD_STORAGE_MODES = STORGE_MODES;
  readonly THEMES = THEMES;
  readonly PASSWORD_STRENGTH_LEVELS = PASSWORD_STRENGTH_LEVELS;

  readonly radioInputs = [
    {
      labelText: 'Master Password Storage Mode',
      formControlName: 'masterPasswordStorgeMode',
      options: STORGE_MODES,
    },
    {
      labelText: 'Theme',
      formControlName: 'theme',
      options: THEMES,
    },
    {
      labelText: 'Minimum Password Strength',
      formControlName: 'minimumPasswordStrength',
      options: PASSWORD_STRENGTH_LEVELS,
    },
  ];

  readonly numberInputs = [
    {
      labelText: 'Master Password TTL',
      formControlName: 'masterPasswordTTL',
    },
    {
      labelText: 'Auto Lock Timeout',
      formControlName: 'autoLockTimeout',
    },
  ];

  userSettingsFormGroup = this.#formBuilder.group({
    masterPasswordTTL: ['', [Validators.required, Validators.min(1)]],
    masterPasswordStorgeMode: ['', [Validators.required]],
    autoLockTimeout: ['', [Validators.required, Validators.min(0)]],
    theme: ['', [Validators.required]],
    minimumPasswordStrength: ['', [Validators.required]],
  });

  ngOnInit() {
    this.#userSettingsHttpService.get().subscribe({
      next: ({ data }) => {
        data ? this.#patchFormValues(data) : this.resetToDefualtSettings();
      },
      error: (err) => {
        this.#errorService.handleError(err, { showToast: true });
        this.resetToDefualtSettings();
      },
    });
  }

  async onSubmit() {
    if (this.userSettingsFormGroup.invalid) {
      return;
    }
    const dto = this.userSettingsFormGroup.value as IUserSettingsEditDTO;

    this.#userSettingsHttpService.save(dto).subscribe({
      next: ({ data }) => {
        this.#patchFormValues(data);
      },
      error: (err) => {
        this.#errorService.handleError(err, { showToast: true });
      },
    });
  }

  getErrorMessage(controlName: string, label?: string): string | null {
    const control = this.userSettingsFormGroup.get(controlName);
    if (!control) {
      return null;
    }

    if (!control.errors || !control.touched) {
      return null;
    }
    if (control.errors['required']) {
      return `${label} is required`;
    }

    if (control.errors['min']) {
      const minValue = control.errors['min'].min;
      return `${label} must be at least ${minValue}`;
    }

    return null;
  }

  resetToDefualtSettings() {
    const defualtSettings: IUserSettingsEditDTO = {
      masterPasswordTTL: '30',
      masterPasswordStorgeMode: 'none',
      autoLockTimeout: '5',
      theme: 'system',
      minimumPasswordStrength: 'very-strong',
    };
    this.userSettingsFormGroup.patchValue(defualtSettings);
  }

  getRadioText(type: TRadioMapKey) {
    return this.#RADIO_TEST_MAP[type];
  }

  #patchFormValues(data: IUserSettingsEditDTO) {
    this.userSettingsFormGroup.patchValue({
      masterPasswordTTL: data.masterPasswordTTL?.toString(),
      masterPasswordStorgeMode: data.masterPasswordStorgeMode,
      autoLockTimeout: data.autoLockTimeout?.toString(),
      theme: data.theme,
      minimumPasswordStrength: data.minimumPasswordStrength,
    });
  }
}
