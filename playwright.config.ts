import { defineConfig } from '@playwright/test';
import { getSettings } from './src/config/settings';

const settings = getSettings();

function shouldRunApiGlobalSetup(): boolean {
  const args = process.argv.slice(2);
  const selectedProjects = new Set<string>();

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--project' && args[i + 1]) {
      selectedProjects.add(args[i + 1]);
      i += 1;
      continue;
    }

    if (arg.startsWith('--project=')) {
      selectedProjects.add(arg.slice('--project='.length));
    }
  }

  if (selectedProjects.size === 0) {
    return true;
  }

  return selectedProjects.has('api') || selectedProjects.has('api-e2e');
}

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright']],
  globalSetup: shouldRunApiGlobalSetup() ? './global-setup.ts' : undefined,
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      testIgnore: /tests\/api\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: settings.apiHttpClient.url,
        ignoreHTTPSErrors: true,
      },
    },
    {
      name: 'api-e2e',
      testMatch: /tests\/api\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: settings.apiHttpClient.url,
        ignoreHTTPSErrors: true,
      },
    },
    {
      name: 'e2e',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: settings.e2e.baseUrl,
        ignoreHTTPSErrors: false,
        browserName: settings.e2e.browserName,
        headless: settings.e2e.headless,
        launchOptions: {
          slowMo: settings.e2e.slowMoMs,
        },
      },
    },
  ],
});
