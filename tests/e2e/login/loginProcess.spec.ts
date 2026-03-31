import { AppSettings } from '../../../src/config/settings';
import { test } from '../fixtures';
import { LoginPage } from '../pages/loginPage';

function getRegularUserCreds(settings: AppSettings) {
  const creds = settings.authCredentialsUser ?? settings.authCredentials;
  test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

  if (!creds) {
    throw new Error('AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');
  }

  return creds;
}

test.describe('Login process', () => {
  test.beforeEach(async ({ page, settings }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
  });

  test('Verify login fails with invalid username', async ({ page, settings }) => {
    const creds = getRegularUserCreds(settings);
    const invalidCreds = LoginPage.invalidUsernameVariant(creds);

    const loginPage = new LoginPage(page);
    await loginPage.login(invalidCreds.identity, invalidCreds.password);
    await loginPage.expectLoginFailedError();
  });

  test('Verify login fails with invalid password', async ({ page, settings }) => {
    const creds = getRegularUserCreds(settings);
    const invalidCreds = LoginPage.invalidPasswordVariant(creds);

    const loginPage = new LoginPage(page);
    await loginPage.login(invalidCreds.identity, invalidCreds.password);
    await loginPage.expectLoginFailedError();
  });

  test('Verify user can log in with valid credentials', async ({ page, settings }) => {
    getRegularUserCreds(settings);

    const loginPage = new LoginPage(page);
    await loginPage.loginAsRegularUser();
    await loginPage.expectLoginSuccess();
  });
});
