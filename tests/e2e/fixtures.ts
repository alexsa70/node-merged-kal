import { test as base, BrowserContext, Page } from '@playwright/test';
import { getSettings, AppSettings } from '../../src/config/settings';
import { E2eApiSession } from './helpers/api';
import { LoginPage } from './pages/loginPage';

type E2eFixtures = {
  settings: AppSettings;
  authedPage: Page;
  authedPageAdmin: Page;
};

type E2eWorkerFixtures = {
  apiSession: E2eApiSession;
  regularUserContext: BrowserContext;
  regularUserPage: Page;
  adminUserContext: BrowserContext;
  adminUserPage: Page;
};

export const test = base.extend<E2eFixtures, E2eWorkerFixtures>({
  settings: async ({}, use) => {
    await use(getSettings());
  },

  regularUserContext: [async ({ browser }, use) => {
    const settings = getSettings();
    const { baseUrl } = settings.e2e;
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!baseUrl, 'E2E_BASE_URL is not configured');
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const context = await browser.newContext({ ignoreHTTPSErrors: false });
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

  adminUserContext: [async ({ browser }, use) => {
    const settings = getSettings();
    const { baseUrl } = settings.e2e;
    test.skip(!baseUrl, 'E2E_BASE_URL is not configured');
    test.skip(!settings.authCredentialsAdmin, 'AUTH_CREDENTIALS_ADMIN.* is not configured');

    const context = await browser.newContext({ ignoreHTTPSErrors: false });
    await use(context);
    await context.close();
  }, { scope: 'worker' }],

  adminUserPage: [async ({ adminUserContext }, use) => {
    const settings = getSettings();
    const { baseUrl } = settings.e2e;
    const page = await adminUserContext.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.open(baseUrl!);
    await loginPage.loginAsAdminUser();
    await loginPage.expectLoginSuccess();
    await use(page);
    await page.close();
  }, { scope: 'worker' }],

  authedPageAdmin: async ({ adminUserPage }, use) => {
    const settings = getSettings();
    await adminUserPage.goto(settings.e2e.baseUrl!, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await use(adminUserPage);
  },

  apiSession: [async ({}, use) => {
    const session = await E2eApiSession.create(getSettings());
    await use(session);
    await session.dispose();
  }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
