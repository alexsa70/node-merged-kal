import { test as base, Page } from '@playwright/test';
import { getSettings, AppSettings } from '../../src/config/settings';
import { LoginPage } from '../e2e/pages/loginPage';

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

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    if (creds) {
      const loginPage = new LoginPage(page);

      if (await loginPage.usernameInput.isVisible({ timeout: 10_000 }).catch(() => false)) {
        await loginPage.fillForm(creds.identity, creds.password);
        await loginPage.passwordInput.press('Enter');
        await page.waitForURL((url) => !url.pathname.includes('login') && url.href !== baseUrl, {
          timeout: 30_000,
        });
        await page.waitForLoadState('networkidle');
      }
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
