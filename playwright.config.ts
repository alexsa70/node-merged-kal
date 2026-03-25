import { defineConfig, devices } from '@playwright/test';
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
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright'],
    ['junit', { outputFile: 'playwright-results.xml' }],
  ],
  globalSetup: shouldRunApiGlobalSetup() ? './global-setup.ts' : undefined,

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // ── Screenshot comparison defaults (used by toHaveScreenshot) ────────────
  expect: {
    toHaveScreenshot: {
      threshold: 0.1,            // per-pixel color diff tolerance (0–1)
      maxDiffPixelRatio: 0.01,   // up to 1% of pixels may differ
      animations: 'disabled',    // freeze CSS animations for stable shots
    },
  },

  // ── Snapshot path: tests/visual/snapshots/{testFile}/{platform}/{name} ───
  snapshotPathTemplate: '{testDir}/visual/snapshots/{testFilePath}/{platform}/{arg}{ext}',

  projects: [
    // ── API tests ──────────────────────────────────────────────────────────
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      testIgnore: /tests\/api\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: settings.apiHttpClient.url,
        ignoreHTTPSErrors: true,
      },
    },

    // ── API E2E (authenticated flows via API) ─────────────────────────────
    {
      name: 'api-e2e',
      testMatch: /tests\/api\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: settings.apiHttpClient.url,
        ignoreHTTPSErrors: true,
      },
    },

    // ── Browser E2E ────────────────────────────────────────────────────────
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

    // ── Visual regression ──────────────────────────────────────────────────
    {
      name: 'visual',
      testMatch: /tests\/visual\/.*\.spec\.ts/,
      retries: 1,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: settings.e2e.baseUrl,
        ignoreHTTPSErrors: true,
        headless: true,
        viewport: { width: 1920, height: 1080 },
        // Stable environment for screenshots
        colorScheme: 'light',
        locale: 'en-US',
        timezoneId: 'UTC',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
    },
  ],
});
