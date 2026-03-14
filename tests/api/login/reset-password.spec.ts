import { test, expect } from '../fixtures';
import { fakeEmail } from '../../../src/tools/fakers';

const EXPECTED_MESSAGE = 'Password reset request processed';

test.describe('Authentication /reset_password', () => {
  test('valid email -> 200 + expected message', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.resetPassword({ email: settings.authCredentials?.email ?? '' });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown> | string;
    const message = typeof body === 'string' ? body : String(body.message ?? '');
    expect(message).toBe(EXPECTED_MESSAGE);
  });

  test('with org_name -> 200', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.resetPassword({
      email: settings.authCredentials?.email ?? '',
      org_name: settings.orgName ?? 'acme-corp',
    });
    expect(response.status()).toBe(200);
  });

  test('non-existent email -> 200', async ({ apiClient }) => {
    const response = await apiClient.resetPassword({ email: fakeEmail() });
    expect(response.status()).toBe(200);
  });

  test('valid/invalid emails return identical response', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const valid = await apiClient.resetPassword({ email: settings.authCredentials?.email ?? '' });
    const invalid = await apiClient.resetPassword({ email: fakeEmail() });

    expect(valid.status()).toBe(invalid.status());
    expect(await valid.json()).toEqual(await invalid.json());
  });

  test('timing difference < 500ms', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');

    const t1 = Date.now();
    await apiClient.resetPassword({ email: settings.authCredentials?.email ?? '' });
    const validMs = Date.now() - t1;

    const t2 = Date.now();
    await apiClient.resetPassword({ email: fakeEmail() });
    const invalidMs = Date.now() - t2;

    expect(Math.abs(validMs - invalidMs)).toBeLessThan(500);
  });

  test('missing email -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/reset_password', { org_name: 'acme-corp' });
    expect([400, 422]).toContain(response.status());
  });

  test('empty body -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/reset_password', {});
    expect([400, 422]).toContain(response.status());
  });

  test('rate limit -> 429 after repeated requests', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const statusCodes: number[] = [];

    for (let i = 0; i < 15; i += 1) {
      const response = await apiClient.resetPassword({ email: settings.authCredentials?.email ?? '' });
      statusCodes.push(response.status());
      if (response.status() === 429) {
        break;
      }
    }

    expect(statusCodes).toContain(429);
  });

  test('response must not leak user data', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.resetPassword({ email: settings.authCredentials?.email ?? '' });
    const body = (await response.json()) as Record<string, unknown>;

    const sensitiveKeys = ['token', 'accessToken', 'password', 'id', 'email'];
    for (const key of sensitiveKeys) {
      expect(Object.prototype.hasOwnProperty.call(body, key)).toBeFalsy();
    }
  });
});
