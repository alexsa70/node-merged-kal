import { test } from '../fixtures';
import { LoginPage } from '../pages/loginPage';

test.describe('E2E login process', () => {
  test.beforeEach(async ({ page, settings }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');
    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
  });

  test('login with invalid username', async ({ page, settings }) => {
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const invalidCreds = LoginPage.invalidUsernameVariant({
      identity: creds!.identity,
      password: creds!.password,
    });

    const loginPage = new LoginPage(page);
    await loginPage.login(invalidCreds.identity, invalidCreds.password);
    await loginPage.expectLoginFailedToast();
  });

  test('login with invalid password', async ({ page, settings }) => {
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const invalidCreds = LoginPage.invalidPasswordVariant({
      identity: creds!.identity,
      password: creds!.password,
    });

    const loginPage = new LoginPage(page);
    await loginPage.login(invalidCreds.identity, invalidCreds.password);
    await loginPage.expectLoginFailedToast();
  });

  test('login with valid credentials', async ({ page, settings }) => {
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const loginPage = new LoginPage(page);
    await loginPage.loginAsRegularUser();
    await loginPage.expectLoginSuccess();
  });
});
