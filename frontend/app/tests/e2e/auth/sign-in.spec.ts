import { test, expect, Cookie } from '@playwright/test';
import { AuthPage } from '../../page-objects/auth.page';
import { IAuthSignUpDto } from '../../../src/app/features/auth/interfaces/auth.interface';
import { createTestUser } from '../../fixtures/data.fixture';
import { deleteUser } from '../../helpers/clean-up';

test.describe('Sign In Flow', () => {
  let authPage: AuthPage;
  let testUser: Required<IAuthSignUpDto>;
  const createdUsers: { id: string; token: string }[] = [];

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    testUser = createTestUser();
  });

  test.afterAll(async () => {
    console.info(`Cleaning up ${createdUsers.length} test users...`);

    for (const user of createdUsers) {
      await deleteUser(user.id, user.token);
    }
  });

  test('should successfully sign in with valid credentials', async ({ page }) => {
    await authPage.goto();

    // Intercept the sign-up response to capture the user ID
    const signUpResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/Sign-up') && response.status() === 201
    );

    await authPage.signUp({ ...testUser, masterPassword: testUser.encryptedMasterKeyWithRecovery });

    const response = await signUpResponsePromise;
    const responseBody = await response.json();
    const userId = responseBody.data?.user?.id;

    const cookies = await page.context().cookies();
    const authToken = getAuthTokenFromCookies(cookies);

    if (userId && authToken) {
      createdUsers.push({ id: userId, token: authToken });
    }

    await expect(page).toHaveURL(/\/entries/);

    await authPage.goto();

    await authPage.switchToSignIn();
    await authPage.signIn(
      testUser.email,
      testUser.password,
      testUser.encryptedMasterKeyWithRecovery
    );

    await expect(page).toHaveURL(/\/entries/);

  });

  test('should show error with invalid credentials', async ({ page }) => {
    await authPage.goto();
    await authPage.switchToSignIn();

    await authPage.emailInput.fill('nonexistent@example.com');
    await authPage.masterPasswordInput.fill('wrong-master');
    await authPage.passwordInput.fill('wrong-password');
    await authPage.submitButton.click();

    await expect(page).toHaveURL(/\/auth/);

    const errorExists = await page.locator('.error-message, .toast').count();
    expect(errorExists).toBeGreaterThan(0);
  });

  test('should validate required fields', async ({ page }) => {
    await authPage.goto();
    await authPage.switchToSignIn();

    await authPage.submitButton.click();

    const isDisabled = await authPage.isSubmitDisabled();
    expect(isDisabled).toBe(true);

    await authPage.emailInput.click();
    await authPage.passwordInput.click();
    await authPage.masterPasswordInput.click();

    const emailError = await authPage.getErrorMessage('email');
    expect(emailError).toContain('required');
  });

  test('should toggle between sign in and sign up modes', async ({ page }) => {
    await authPage.goto();

    const isSignIn = await authPage.isSignInMode();
    expect(isSignIn).toBe(true);

    await authPage.switchToSignUp();
    const isSignUp = await authPage.isSignUpMode();
    expect(isSignUp).toBe(true);

    await expect(authPage.usernameInput).toBeVisible();

    await authPage.switchToSignIn();
    const isSignInAgain = await authPage.isSignInMode();
    expect(isSignInAgain).toBe(true);

    await expect(authPage.usernameInput).not.toBeVisible();
  });
});

function getAuthTokenFromCookies(cookies: Cookie[]) {
  const authCookie = cookies.find(
    (cookie) => cookie.name === 'authToken' || cookie.name === 'AuthToken'
  );
  return authCookie ? authCookie.value : null;
}
