import { defineConfig } from '@playwright/test';
import { getSettings } from './src/config/settings';

const settings = getSettings();

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright']],
  globalSetup: './global-setup.ts',
  use: {
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: settings.apiHttpClient.url,
      },
    },
    {
      name: 'e2e',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: settings.e2e.baseUrl,
        browserName: settings.e2e.browserName,
        headless: settings.e2e.headless,
        launchOptions: {
          slowMo: settings.e2e.slowMoMs,
        },
      },
    },
  ],
});
