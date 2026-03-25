import { test } from './fixtures';
import { expectScreenshot, stabilizePage } from '../../src/tools/visual';
import { LoginPage } from '../e2e/pages/loginPage';

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
    const loginPage = new LoginPage(page);
    await loginPage.open(baseUrl!);
    await stabilizePage(page);
  });

  test('login page default state @smoke', async ({ page }) => {
    await expectScreenshot(page, 'login-default.png', { fullPage: true });
  });

  test('login page - password field masked', async ({ page }) => {
    const loginPage = new LoginPage(page);
    if (await loginPage.passwordInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expectScreenshot(page, 'login-with-password-field.png', { fullPage: true });
    } else {
      test.skip(true, 'No password field found on login page');
    }
  });

  test('login page - filled form state', async ({ page, settings }) => {
    const creds = settings.authCredentials;
    if (!creds) test.skip(true, 'AUTH_CREDENTIALS not configured');

    const loginPage = new LoginPage(page);
    if (await loginPage.usernameInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await loginPage.fillForm(creds!.identity, '••••••••');

      await expectScreenshot(page, 'login-filled.png', {
        fullPage: true,
        mask: [loginPage.passwordInput],
      });
    } else {
      test.skip(true, 'Login form not visible');
    }
  });
});
