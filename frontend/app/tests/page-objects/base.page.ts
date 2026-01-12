import { Page, Locator, Cookie } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  async waitForNavigation(url?: string | RegExp): Promise<void> {
    url ? await this.page.waitForURL(url) : await this.page.waitForLoadState('networkidle');
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async clickAndWaitForNavigation(locator: Locator, url?: string | RegExp): Promise<void> {
    await Promise.all([this.page.waitForURL(url || /.*/), locator.click()]);
  }

  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async clickButton(locator: Locator): Promise<void> {
    await locator.click();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async waitForElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `tests/visual-snapshots/${name}.png`, fullPage: true });
  }

  async getCookies(): Promise<Cookie[]> {
    return await this.page.context().cookies();
  }

  async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }
}
