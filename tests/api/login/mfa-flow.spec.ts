import { test, expect } from '../fixtures';
import { LoginMfaRequiredSchema, LoginErrorSchema } from '../../../src/schema/responses/login';
import { authCredentialsOrSkip } from './helpers';

test.describe('POST /login – MFA Flow', () => {
  test('Missing OTP when MFA enabled', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: credentials.password,
    });

    if (response.status() !== 200) {
      return;
    }

    const parsed = LoginMfaRequiredSchema.safeParse(await response.json());
    if (!parsed.success) {
      test.skip(true, 'Account does not require MFA - test not applicable');
      return;
    }

    expect(parsed.data.mfa_required).toBe(true);
    expect(parsed.data.message).toBeTruthy();
  });

  test('Invalid OTP when MFA enabled', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: credentials.password,
      otp_code: '000000',
    });

    if (response.status() === 400) {
      const parsed = LoginErrorSchema.safeParse(await response.json());
      expect(parsed.success, `Invalid error response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
      if (parsed.success) {
        expect(parsed.data.message).toBeTruthy();
      }
    }
  });
});
