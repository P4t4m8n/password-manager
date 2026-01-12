import { test, expect } from '@playwright/test';
import { deleteUser } from '../../helpers/clean-up';
import { AuthPage } from '../../page-objects/auth.page';

test.describe('Auth - Sign Up Flow', () => {
  let createdUserId: string | null = null;
  const testUser = {
    username: `TestUser_${Date.now()}`,
    email: `test_user_${Date.now()}@example.com`,
    password: 'Password123!',
    masterPassword: 'MasterPassword123!',
  };

  test.afterEach(async () => {
    if (createdUserId) {
      await deleteUser(createdUserId);
    }
  });

  test('Sign-up flow - should succeed and return correct data', async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.goto();

    await authPage.fillSignUpForm(testUser);

    const signUpResponsePromise = page.waitForResponse((resp) =>
      resp.url().toLowerCase().includes('sign-up')
    );
    await authPage.submitButton.click();
    const signUpResponse = await signUpResponsePromise;
    const body = await signUpResponse.json();

    createdUserId = body.data?.user?.id;

    const returnedUser = body.data.user;

    expect(returnedUser.username).toBe(testUser.username);
    expect(returnedUser.email).toBe(testUser.email);

    expect(returnedUser.id).toBeTruthy();

    const settings = returnedUser.settings;
    expect(settings).toBeDefined();
    expect(settings.userId).toBe(returnedUser.id);
    expect(settings.masterPasswordTTLInMinutes).toEqual(expect.any(Number));
    expect(settings.autoLockTimeInMinutes).toEqual(expect.any(Number));

    expect(settings.theme).toEqual(expect.any(String));
    expect(settings.minimumPasswordStrength).toEqual(expect.any(String));
    expect(settings.masterPasswordStorageMode).toEqual(expect.any(String));

    expect(settings.createdAt).toBeTruthy();
    expect(settings.updatedAt).toBeTruthy();

    expect(body.data.masterPasswordSalt).toBeDefined();

    const recoveryDialog = page.locator('.dialog').filter({ hasText: 'Your Recovery Key' });
    await expect(recoveryDialog).toBeVisible();
    await expect(recoveryDialog.locator('.copy-con p')).not.toBeEmpty();

    await recoveryDialog.getByRole('button', { name: 'Close' }).click();
    await expect(recoveryDialog).not.toBeVisible();

    const confirmDialog = page.locator('.dialog').filter({ hasText: 'Navigate to Settings' });
    await expect(confirmDialog).toBeVisible();

    await confirmDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(confirmDialog).not.toBeVisible();

    await expect(page).toHaveURL(/.*\/entries/);
  });

  test.describe('Sign Up Form Validation', () => {
    let authPage: AuthPage;

    test.beforeEach(async ({ page }) => {
      authPage = new AuthPage(page);
      await authPage.goto();
      await authPage.toggleAuthModeLink.click();
      // Click submit to trigger validation on all fields
      await authPage.submitButton.click();
    });

    test('should validate Username field', async () => {
      const errorMsg = authPage.page.getByText('Username is required');
      await expect(errorMsg).toBeVisible();

      await authPage.usernameInput.fill('MyUser');
      await expect(errorMsg).not.toBeVisible();
    });

    test('should validate Email field', async () => {
      const requiredMsg = authPage.page.getByText('Email is required');
      const invalidMsg = authPage.page.getByText('Please enter a valid email address');

      await expect(requiredMsg).toBeVisible();

      // Invalid format
      await authPage.emailInput.fill('bad-email');
      await expect(requiredMsg).not.toBeVisible();
      await expect(invalidMsg).toBeVisible();

      // Valid format
      await authPage.emailInput.fill('good@email.com');
      await expect(invalidMsg).not.toBeVisible();
    });

    test('should validate Password field', async () => {
      const errorMsg = authPage.page.getByText('Password is required', { exact: true });
      await expect(errorMsg).toBeVisible();

      await authPage.passwordInput.fill('SomePass');
      await expect(errorMsg).not.toBeVisible();
    });

    test('should validate Confirm Password field', async () => {
      const errorMsg = authPage.page.getByText('Confirm Password is required', { exact: true });
      await expect(errorMsg).toBeVisible();

      await authPage.confirmPasswordInput.fill('SomePass');
      await expect(errorMsg).not.toBeVisible();
    });

    test('should validate Master Password field', async () => {
      const errorMsg = authPage.page.getByText('Master Password is required', { exact: true });
      await expect(errorMsg).toBeVisible();

      await authPage.masterPasswordInput.fill('MySecret');
      await expect(errorMsg).not.toBeVisible();
    });

    test('should validate Password Mismatch', async () => {
      await authPage.passwordInput.fill('Password123');
      await authPage.confirmPasswordInput.fill('Password456');

      await authPage.confirmPasswordInput.blur();

      const errorMsg = authPage.page.getByText('Passwords do not match');
      await expect(errorMsg).toBeVisible();

      await authPage.confirmPasswordInput.fill('Password123');
      await expect(errorMsg).not.toBeVisible();
    });

    test('should validate Username Max Length', async () => {
      const longUsername = 'a'.repeat(101);
      await authPage.usernameInput.fill(longUsername);
      await authPage.usernameInput.blur();

      const errorMsg = authPage.page.getByText('Username cannot exceed 100 characters');
      await expect(errorMsg).toBeVisible();
    });
  });

  test('should trim whitespace from Username and Email', async ({ page }) => {
    const authPage = new AuthPage(page);
    const time = Date.now();
    const untrimmedUser = {
      ...testUser,
      username: `  SpaceUser_${time}  `,
      email: `  space_user_${time}@example.com  `,
    };

    await authPage.goto();

    await authPage.fillSignUpForm(untrimmedUser);

    const signUpResponsePromise = page.waitForResponse((resp) =>
      resp.url().toLowerCase().includes('sign-up')
    );
    await authPage.submitButton.click();
    const signUpResponse = await signUpResponsePromise;
    const body = await signUpResponse.json();

    createdUserId = body.data?.user?.id;

    expect(body.data.user.username).toBe(untrimmedUser.username.trim());
    expect(body.data.user.email).toBe(untrimmedUser.email.trim());
  });

  test('should return error when signing up with an existing email', async ({ page }) => {
    const authPage = new AuthPage(page);
    const email = `duplicate_${Date.now()}@test.com`;
    const user1User = { ...testUser, email };

    await authPage.goto();
    await authPage.fillSignUpForm(user1User);

    const successResponsePromise = page.waitForResponse(
      (resp) => resp.url().toLowerCase().includes('sign-up') && resp.status() === 201
    );
    await authPage.submitButton.click();

    const successResponse = await successResponsePromise;
    const body = await successResponse.json();
    createdUserId = body.data?.user?.id;

    // Close recovery and confirm dialogs
    const recoveryDialog = page.locator('.dialog').filter({ hasText: 'Your Recovery Key' });
    await recoveryDialog.getByRole('button', { name: 'Close' }).click();
    const confirmDialog = page.locator('.dialog').filter({ hasText: 'Navigate to Settings' });
    await confirmDialog.getByRole('button', { name: 'Cancel' }).click();

    // Sign Out after first successful sign-up
    await page.getByRole('button', { name: 'Sign Out' }).click();

    // Now attempt to sign up again with the SAME email
    await authPage.goto();

    await authPage.fillSignUpForm({ ...user1User, username: 'OtherUser' });

    const errorResponsePromise = page.waitForResponse(
      (resp) => resp.url().toLowerCase().includes('sign-up') && resp.status() !== 201
    );
    await authPage.submitButton.click();
    const errorResponse = await errorResponsePromise;

    expect(errorResponse.status()).toBe(409);

    // const errorBody = await errorResponse.json();
  });

  test('should handle XSS and Injection payloads safely', async ({ page }) => {
    const authPage = new AuthPage(page);

    const xssPayload = "<script>alert('XSS')</script>";

    const maliciousUser = {
      ...testUser,
      username: xssPayload,
      email: `security_${Date.now()}@test.com`,
    };

    await authPage.goto();
    await authPage.fillSignUpForm(maliciousUser);

    const responsePromise = page.waitForResponse((resp) =>
      resp.url().toLowerCase().includes('sign-up')
    );

    await authPage.submitButton.click();
    const response = await responsePromise;

    expect(response.status()).not.toBe(500);

    if (response.status() === 201) {
      const body = await response.json();
      createdUserId = body.data?.user?.id;

      const returnedUsername = body.data.user.username;

      console.log('Returned Username for Security Test:', returnedUsername);
      expect(returnedUsername).toBeDefined();
    } else {
      expect(response.status()).toBe(400);
    }
  });
});
