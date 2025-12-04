import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '') {
    await this.page.goto(path);
  }

  async waitForNavigation(url?: string | RegExp) {
    if (url) {
      await this.page.waitForURL(url);
    } else {
      await this.page.waitForLoadState('networkidle');
    }
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async clickAndWaitForNavigation(locator: Locator, url?: string | RegExp) {
    await Promise.all([this.page.waitForURL(url || /.*/), locator.click()]);
  }

  async fillField(locator: Locator, value: string) {
    await locator.fill(value);
  }

  async clickButton(locator: Locator) {
    await locator.click();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
  }

  async getTextContent(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/visual-snapshots/${name}.png`, fullPage: true });
  }

  async getCookies() {
    return await this.page.context().cookies();
  }

  async clearCookies() {
    await this.page.context().clearCookies();
  }
}
