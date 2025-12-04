import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for Authentication (Sign In / Sign Up)
 */
export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly masterPasswordInput: Locator;
  readonly usernameInput: Locator;
  readonly confirmPasswordInput: Locator;

  readonly submitButton: Locator;
  readonly toggleAuthModeLink: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.masterPasswordInput = page.locator('#masterPassword');
    this.usernameInput = page.locator('#username');
    this.confirmPasswordInput = page.locator('#confirmPassword');

    this.submitButton = page.locator('button[type="submit"]');
    this.toggleAuthModeLink = page.locator('.toggle-btn');
  }

  async goto() {
    await this.page.goto('/auth');
  }

  async signIn(email: string, password: string, masterPassword: string) {
    await this.emailInput.fill(email);
    await this.masterPasswordInput.fill(masterPassword);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL(/\/entries/);
  }

  async signUp({
    username,
    email,
    password,
    masterPassword,
  }: {
    username: string;
    email: string;
    password: string;
    masterPassword: string;
  }) {
    await this.switchToSignUp();

    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.masterPasswordInput.fill(masterPassword);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);

    await this.submitButton.click();
    await this.page.waitForURL(/\/entries/);
  }

  async switchToSignIn() {
    const headerText = await this.page.locator('h2').textContent();
    if (headerText?.includes('SIGN UP')) {
      await this.toggleAuthModeLink.click();
      await this.page.waitForTimeout(300);
    }
  }

  async switchToSignUp() {
    const headerText = await this.page.locator('h2').textContent();
    if (headerText?.includes('SIGN-IN')) {
      await this.toggleAuthModeLink.click();
      await this.page.waitForTimeout(300);
    }
  }

  async getErrorMessage(fieldName: string): Promise<string> {
    const errorSpan = this.page.locator(
      `li:has(input[formcontrolname="${fieldName}"]) .error-message`
    );
    return (await errorSpan.textContent()) || '';
  }

  async isSubmitDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async isSignInMode(): Promise<boolean> {
    const headerText = await this.page.locator('h2').textContent();
    return headerText?.includes('SIGN-IN') || false;
  }

  async isSignUpMode(): Promise<boolean> {
    const headerText = await this.page.locator('h2').textContent();
    return headerText?.includes('SIGN UP') || false;
  }
}
