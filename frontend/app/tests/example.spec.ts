import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:4200/');

  await expect(page.getByRole('heading', { name: 'Sign-In' })).toBeVisible();
});
