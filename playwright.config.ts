import { defineConfig, devices } from '@playwright/test';
import { getSettings } from './src/config/settings';

const settings = getSettings();

/**
 * Returns the global-setup path only when API projects are being run.
 * E2E and visual projects do not need a global setup.
 */
function shouldRunApiGlobalSetup(): string | undefined {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const project = arg === '--project' ? args[i + 1] : arg.startsWith('--project=') ? arg.slice('--project='.length) : null;
    if (project === 'api' || project === 'api-e2e') {
      return './global-setup.ts';
    }
  }

  // No --project flag means all projects run — include API setup.
  const hasProjectFilter = args.some(a => a === '--project' || a.startsWith('--project='));
  if (!hasProjectFilter) {
    return './global-setup.ts';
  }

  return undefined;
}

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright'],
    ['junit', { outputFile: 'playwright-results.xml' }],
  ],
  globalSetup: shouldRunApiGlobalSetup(),

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
