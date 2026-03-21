import { test, expect } from './fixtures';
import { expectScreenshot, stabilizePage } from '../../src/tools/visual';

/**
 * Visual tests for the Login page.
 *
 * First run: baselines are created automatically — no failure.
 * To update baselines: npx playwright test --project=visual --update-snapshots
 */
test.describe('Login page visual', () => {

  test.beforeEach(async ({ page, settings }) => {
    const { baseUrl } = settings.e2e;
    if (!baseUrl) test.skip(true, 'E2E_BASE_URL not configured');
    await page.goto(baseUrl!);
    await stabilizePage(page);
  });

  test('login page default state @smoke', async ({ page }) => {
    await expectScreenshot(page, 'login-default.png', { fullPage: true });
  });

  test('login page - password field masked', async ({ page }) => {
    // Ensure password field renders correctly (masked)
    const passwordField = page.locator('input[type="password"]').first();
    if (await passwordField.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expectScreenshot(page, 'login-with-password-field.png', { fullPage: true });
    } else {
      test.skip(true, 'No password field found on login page');
    }
  });

  test('login page - filled form state', async ({ page, settings }) => {
    const creds = settings.authCredentials;
    if (!creds) test.skip(true, 'AUTH_CREDENTIALS not configured');

    const usernameInput = page.locator('input[name="identity"], input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await usernameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await usernameInput.fill(creds!.identity);
      await passwordInput.fill('••••••••'); // Don't screenshot real password

      await expectScreenshot(page, 'login-filled.png', {
        fullPage: true,
        // Mask the password field to avoid capturing actual value
        mask: [passwordInput],
      });
    } else {
      test.skip(true, 'Login form not visible');
    }
  });
});
