import { expect, test } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { LoginPage } from '../pages/loginPage';
import { UserSettingsPage } from '../pages/userSettingsPage';

const settings = getSettings();

test.describe('E2E settings page', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
    await loginPage.loginAsRegularUser();
    await loginPage.expectLoginSuccess();
  });

  test('validate settings page shows username', async ({ page }) => {
    const settingsPage = new UserSettingsPage(page);
    await settingsPage.open(String(settings.e2e.baseUrl));

    const username = await settingsPage.getUsername();
    expect(username.trim().length).toBeGreaterThan(0);
  });
});
