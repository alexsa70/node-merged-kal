import { test as base, Page } from '@playwright/test';
import { getSettings, AppSettings } from '../../src/config/settings';

type VisualFixtures = {
  settings: AppSettings;
  /**
   * Authenticated page: navigates to the app and logs in via UI credentials.
   * Reused within a describe block to avoid re-login on every test.
   */
  authedPage: Page;
};

export const test = base.extend<VisualFixtures>({
  settings: async ({}, use) => {
    await use(getSettings());
  },

  authedPage: async ({ page, settings }, use) => {
    const { baseUrl } = settings.e2e;
    const creds = settings.authCredentials;

    if (!baseUrl) {
      throw new Error('E2E_BASE_URL is not configured. Set it in .env');
    }

    if (creds) {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');

      // Fill login form if credentials are configured
      const usernameInput = page.locator('input[name="identity"], input[type="email"], input[placeholder*="user" i]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const loginButton = page.locator('button[type="submit"]').first();

      if (await usernameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await usernameInput.fill(creds.identity);
        await passwordInput.fill(creds.password);
        await loginButton.click();
        await page.waitForLoadState('networkidle');
      }
    } else {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
