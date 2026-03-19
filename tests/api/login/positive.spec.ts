import { test, expect } from '../fixtures';
import { LoginResponseSchema, LoginSuccessSchema } from '../../../src/schema/responses/login';
import { authCredentialsOrSkip, makeLoginPayload } from '../helpers/auth';

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

      const response = await apiClient.auth.login(makeLoginPayload(settings, credentials));
      expect(response.status()).toBe(200);

      const parsed = LoginResponseSchema.safeParse(await response.json());
      expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    });
  }

  test('Login with otp as empty string when MFA disabled', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: credentials.password,
      otp_code: '',
    });
    expect(response.status()).toBe(200);

    const parsed = LoginResponseSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

    if (parsed.success && 'mfa_required' in parsed.data) {
      test.skip(!credentials.otpSecret, 'MFA required but AUTH_CREDENTIALS.OTP_SECRET not set in .env');
    }
  });

  test('Username case-insensitive (if supported)', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: 'ALEX',
      password: credentials.password
    });
    expect(response.status()).toBe(200);

    const parsed = LoginResponseSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);    
  });

   test('Use email format in the "identity" – 200 OK', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: 'alexsa70@gmail.com',
      password: credentials.password
    });
    expect(response.status()).toBe(200);

    const parsed = LoginResponseSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);    
  });

  test('verify values in response', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login(makeLoginPayload(settings, credentials));
    expect(response.status()).toBe(200);

    const parsed = LoginSuccessSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

    if (parsed.success) {
      expect(parsed.data.refresh_token).toBeTruthy();
      expect(parsed.data.expires_in).toBe(36000);
    }
  });

  // test('expiresIn equals expected value (3600)', async ({ apiClient, settings }) => {
  //   const credentials = authCredentialsOrSkip(settings);
  //   const response = await apiClient.auth.login(makeLoginPayload(settings, credentials));
  //   expect(response.status()).toBe(200);

  //   const parsed = LoginSuccessSchema.safeParse(await response.json());
  //   expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

  //   if (parsed.success) {
  //     expect(parsed.data.expires_in).toBe(36000);
  //   }
  // });
});
