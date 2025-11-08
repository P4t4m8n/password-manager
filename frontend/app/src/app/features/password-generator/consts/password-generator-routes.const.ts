import { Routes } from '@angular/router';
import { PasswordGenerator } from '../pages/password-generator/password-generator';

export const PASSWORD_GENERATOR_PATHS = {
  passwordGenerator: 'password-generator',
};

export const PASSWORD_GENERATOR_ROUTES: Routes = [
  {
    path: PASSWORD_GENERATOR_PATHS.passwordGenerator,
    component: PasswordGenerator,
  },
];

export const PASSWORD_STRENGTH = ['weak', 'medium', 'strong', 'very-strong'] as const;
