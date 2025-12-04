import { test as base, Page } from '@playwright/test';
import { AuthPage } from '../page-objects/auth.page';
import type { IAuthSignUpDto } from '../../src/app/features/auth/interfaces/auth.interface';
import { createTestUser } from './data.fixture';

type AuthFixtures = {
  authenticatedPage: Page;
  testUser: Required<IAuthSignUpDto>;
  authPage: AuthPage;
};

/**
 * tests that require a logged-in user
 */
export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const user = createTestUser();
    await use(user);
  },

  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    const authPage = new AuthPage(page);

    await authPage.goto();
    await authPage.signUp({ ...testUser, masterPassword: testUser.encryptedMasterKeyWithRecovery });

    await page.waitForURL(/\/entries/);

    await use(page);
  },
});

