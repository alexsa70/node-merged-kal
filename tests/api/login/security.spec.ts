import { test, expect } from '../fixtures';
import { fakeEmail, fakeOrgName, fakePassword } from '../../../src/tools/fakers';
import { authCredentialsOrSkip, makeLoginPayload } from '../helpers/auth';
import { LoginErrorSchema } from '../../../src/schema/responses/login';

test.describe('POST /login – Security', () => {
  test('Send unknown orgName in the request', async ({ apiClient }) => {
    const response = await apiClient.auth.login({
      orgName: fakeOrgName(),
      identity: fakeEmail(),
      password: fakePassword(),
    });
    expect([400, 401, 403]).toContain(response.status());
  });

  test('Password not returned in response body', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login(makeLoginPayload(settings, credentials));
    const bodyText = await response.text();
    expect(bodyText).not.toContain(credentials.password);
  });

  test('SQL injection in username field', async ({ apiClient, settings }) => {
    const response = await apiClient.auth.login({
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

  test('Error message does not reveal if username exists', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);

    // Request 1: non-existent user
    const nonExistentResponse = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: fakeEmail(),
      password: fakePassword(),
    });

    // Request 2: real user + wrong password
    const wrongPasswordResponse = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: 'wrong_password_!@#$',
    });

    expect(nonExistentResponse.status()).toBe(400);
    expect(wrongPasswordResponse.status()).toBe(400);

    const body1 = await nonExistentResponse.json() as Record<string, unknown>;
    const body2 = await wrongPasswordResponse.json() as Record<string, unknown>;

    const parsed1 = LoginErrorSchema.safeParse(body1);
    const parsed2 = LoginErrorSchema.safeParse(body2);
    expect(parsed1.success).toBe(true);
    expect(parsed2.success).toBe(true);

    if (parsed1.success && parsed2.success) {
      expect(parsed1.data.message).toBe(parsed2.data.message);
    }
  });

  test('Use existing user in DB but with password and organization of another user', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
     const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: 'AutomationUser',
      password: credentials.password,
    });
    expect(response.status()).toBe(400);  
  });

});
