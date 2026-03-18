import { test, expect } from '../fixtures';
import { fakeEmail } from '../../../src/tools/fakers';
import { authCredentialsOrSkip, makeLoginPayload } from './helpers';

test.describe('POST /login – Security', () => {
  test('Password not returned in response body', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.login(makeLoginPayload(settings, credentials));
    const bodyText = await response.text();
    expect(bodyText).not.toContain(credentials.password);
  });

  test('SQL injection in username field', async ({ apiClient, settings }) => {
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: "' OR '1'='1",
      password: 'password',
    });
    expect(response.status()).not.toBe(500);
  });

  test('Brute force protection – lockout after N failed attempts', async ({ apiClient, settings }) => {
    authCredentialsOrSkip(settings);
    const identity = fakeEmail();
    const statusCodes: number[] = [];

    for (let i = 0; i < 10; i += 1) {
      const response = await apiClient.post('/login', {
        orgName: settings.orgName,
        identity,
        password: 'wrong_password',
      });
      statusCodes.push(response.status());
      if (response.status() === 429) {
        break;
      }
    }

    expect(statusCodes).toContain(429);
  });
});
