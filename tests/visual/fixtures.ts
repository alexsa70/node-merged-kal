import { test as base, BrowserContext, Page } from '@playwright/test';
import { getSettings, AppSettings } from '../../src/config/settings';
import { LoginPage } from '../e2e/pages/loginPage';

type VisualFixtures = {
  settings: AppSettings;
  authedPage: Page;
};

type VisualWorkerFixtures = {
  regularUserContext: BrowserContext;
  regularUserPage: Page;
};

export const test = base.extend<VisualFixtures, VisualWorkerFixtures>({
  settings: async ({}, use) => {
    await use(getSettings());
  },

  regularUserContext: [async ({ browser }, use) => {
    const settings = getSettings();
    const { baseUrl } = settings.e2e;
    const creds = settings.authCredentialsUser ?? settings.authCredentials;

    test.skip(!baseUrl, 'E2E_BASE_URL is not configured');
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    await use(context);
    await context.close();
  }, { scope: 'worker' }],

  regularUserPage: [async ({ regularUserContext }, use) => {
    const settings = getSettings();
    const { baseUrl } = settings.e2e;
    const page = await regularUserContext.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.open(baseUrl!);
    await loginPage.loginAsRegularUser();
    await loginPage.expectLoginSuccess();
    await use(page);
    await page.close();
  }, { scope: 'worker' }],

  authedPage: async ({ regularUserPage }, use) => {
    const settings = getSettings();
    await regularUserPage.goto(settings.e2e.baseUrl!, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await use(regularUserPage);
  },
});

export { expect } from '@playwright/test';
