import { Routes } from '@angular/router';
import { PasswordGeneratorPage } from '../pages/password-generator-page/password-generator-page';

export const PASSWORD_GENERATOR_PATHS = {
  passwordGenerator: 'password-generator',
};

export const PASSWORD_GENERATOR_ROUTES: Routes = [
  {
    path: PASSWORD_GENERATOR_PATHS.passwordGenerator,
    component: PasswordGeneratorPage,
  },
];

export const PASSWORD_STRENGTH = ['weak', 'medium', 'strong', 'very-strong'] as const;
