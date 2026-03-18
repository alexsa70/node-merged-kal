import { test, expect } from '../fixtures';
import { LoginResponseSchema, LoginSuccessSchema } from '../../../src/schema/responses/login';
import { authCredentialsOrSkip, makeLoginPayload } from './helpers';

test.describe('POST /login – Positive', () => {
  const ROLES = [
    { label: 'Admin', key: 'authCredentialsAdmin' as const },
    { label: 'User',  key: 'authCredentialsUser'  as const },
  ];
  for (const { label, key } of ROLES) {
    test(`Login with valid credentials (${label})`, { tag: ['@regression', '@smoke'] }, async ({ apiClient, settings }) => {
      const credentials = settings[key];
      test.skip(!credentials, `${label} credentials not set in .env`);
      if (!credentials) return;

      const response = await apiClient.login(makeLoginPayload(settings, credentials));
      expect(response.status()).toBe(200);

      const parsed = LoginResponseSchema.safeParse(await response.json());
      expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    });
  }

  // test('Login with valid credentials (no MFA)', async ({ apiClient, settings }) => {
  //   const credentials = authCredentialsOrSkip(settings);
  //   const response = await apiClient.login(makeLoginPayload(settings, credentials));
  //   expect(response.status()).toBe(200);

  //   const parsed = LoginResponseSchema.safeParse(await response.json());
  //   expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

  //   if (parsed.success && 'mfa_required' in parsed.data) {
  //     test.skip(!credentials.otpSecret, 'MFA required but AUTH_CREDENTIALS.OTP_SECRET not set in .env');
  //   }
  // });

  test('accessToken is a valid JWT', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.login(makeLoginPayload(settings, credentials));
    expect(response.status()).toBe(200);

    const parsed = LoginSuccessSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

    if (parsed.success) {
      expect(parsed.data.token).toMatch(/^eyJ/);
      expect(parsed.data.token.split('.')).toHaveLength(3);

      expect(parsed.data.refresh_token).toMatch(/^eyJ/);
      expect(parsed.data.refresh_token.split('.')).toHaveLength(3);
    }
  });

  test('refreshToken present in response', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.login(makeLoginPayload(settings, credentials));
    expect(response.status()).toBe(200);

    const parsed = LoginSuccessSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

    if (parsed.success) {
      expect(parsed.data.refresh_token).toBeTruthy();
    }
  });

  test('expiresIn equals expected value (3600)', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.login(makeLoginPayload(settings, credentials));
    expect(response.status()).toBe(200);

    const parsed = LoginSuccessSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

    if (parsed.success) {
      expect(parsed.data.expires_in).toBe(36000);
    }
  });
});
