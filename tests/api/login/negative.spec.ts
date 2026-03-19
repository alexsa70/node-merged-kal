import { test, expect } from '../fixtures';
import { fakeEmail, fakePassword } from '../../../src/tools/fakers';
import { LoginErrorSchema } from '../../../src/schema/responses/login';
import { authCredentialsOrSkip } from '../helpers/auth';

test.describe('POST /login – Negative', () => {
  test('Invalid password', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: 'wrong_password_!@#$',
    });
    expect(response.status()).toBe(400);
    const parsed = LoginErrorSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid error response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    if (parsed.success) {
      expect(parsed.data.message).toBe('User name or password incorrect.');
    }
  });

  test('Invalid username', async ({ apiClient, settings }) => {
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: fakeEmail(),
      password: fakePassword(),
    });
    expect(response.status()).toBe(400);
    const parsed = LoginErrorSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid error response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    if (parsed.success) {
      expect(parsed.data.message).toBe('User name or password incorrect.');
    }
  });

  test('Missing password field', async ({ apiClient, settings }) => {
    const response = await apiClient.post('/login', {
      orgName: settings.orgName,
      identity: fakeEmail(),
    });
    expect([400, 422]).toContain(response.status());
  });

  test('Missing username field', async ({ apiClient, settings }) => {
    const response = await apiClient.post('/login', {
      orgName: settings.orgName,
      password: fakePassword(),
    });
    expect([400, 422]).toContain(response.status());
  });

  test('Missing orgName field', async ({ apiClient }) => {
    const response = await apiClient.post('/login', {
      identity: fakeEmail(),
      password: fakePassword(),
    });
    expect([400, 422]).toContain(response.status());
  });

  test('Empty body {}', async ({ apiClient }) => {
    const response = await apiClient.post('/login', {});
    expect([400, 422]).toContain(response.status());
  });
  
});
