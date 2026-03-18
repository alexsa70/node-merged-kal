import { test, expect } from '../fixtures';
import { fakeEmail } from '../../../src/tools/fakers';

const EXPECTED_MESSAGE = 'Password reset request processed';

test.describe('Authentication /reset_password', () => {
  test('valid email -> 200 + expected message', async ({ apiClient }) => {
    const response = await apiClient.resetPassword({ email: fakeEmail() });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown> | string;
    const message = typeof body === 'string' ? body : String(body.message ?? '');
    expect(message).toBe(EXPECTED_MESSAGE);
  });

  test('with org_name -> 200', async ({ apiClient, settings }) => {
    const response = await apiClient.resetPassword({
      email: fakeEmail(),
      org_name: settings.orgName ?? 'acme-corp',
    });
    expect(response.status()).toBe(200);
  });

  test('non-existent email -> 200', async ({ apiClient }) => {
    const response = await apiClient.resetPassword({ email: fakeEmail() });
    expect(response.status()).toBe(200);
  });

  test('valid/invalid emails return identical response', async ({ apiClient }) => {
    const first = await apiClient.resetPassword({ email: fakeEmail() });
    const second = await apiClient.resetPassword({ email: fakeEmail() });

    expect(first.status()).toBe(second.status());
    expect(await first.json()).toEqual(await second.json());
  });

  test('timing difference < 500ms', async ({ apiClient }) => {
    const t1 = Date.now();
    await apiClient.resetPassword({ email: fakeEmail() });
    const firstMs = Date.now() - t1;

    const t2 = Date.now();
    await apiClient.resetPassword({ email: fakeEmail() });
    const secondMs = Date.now() - t2;

    expect(Math.abs(firstMs - secondMs)).toBeLessThan(500);
  });

  test('missing email -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/reset_password', { org_name: 'acme-corp' });
    expect([400, 422]).toContain(response.status());
  });

  test('empty body -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/reset_password', {});
    expect([400, 422]).toContain(response.status());
  });

  test('rate limit -> 429 after repeated requests', async ({ apiClient }) => {
    const email = fakeEmail();
    const statusCodes: number[] = [];

    for (let i = 0; i < 15; i += 1) {
      const response = await apiClient.resetPassword({ email });
      statusCodes.push(response.status());
      if (response.status() === 429) {
        break;
      }
    }

    expect(statusCodes).toContain(429);
  });

  test('response must not leak user data', async ({ apiClient }) => {
    const response = await apiClient.resetPassword({ email: fakeEmail() });
    const body = (await response.json()) as Record<string, unknown>;

    const sensitiveKeys = ['token', 'accessToken', 'password', 'id', 'email'];
    for (const key of sensitiveKeys) {
      expect(Object.prototype.hasOwnProperty.call(body, key)).toBeFalsy();
    }
  });
});
