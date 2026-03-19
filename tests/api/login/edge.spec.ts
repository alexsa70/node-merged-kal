import { test, expect } from '../fixtures';
import { LoginMfaRequiredSchema, LoginErrorSchema } from '../../../src/schema/responses/login';
import { authCredentialsOrSkip } from '../helpers/auth';

test.describe('POST /login – MFA Flow', () => {
  // test('Missing OTP when MFA enabled', async ({ apiClient, settings }) => {
  //   const credentials = authCredentialsOrSkip(settings);
  //   const response = await apiClient.auth.login({
  //     orgName: settings.orgName ?? '',
  //     identity: credentials.identity,
  //     password: credentials.password,
  //   });

  //   if (response.status() !== 200) {
  //     return;
  //   }

  //   const parsed = LoginMfaRequiredSchema.safeParse(await response.json());
  //   if (!parsed.success) {
  //     test.skip(true, 'Account does not require MFA - test not applicable');
  //     return;
  //   }

  //   expect(parsed.data.mfa_required).toBe(true);
  //   expect(parsed.data.message).toBeTruthy();
  // });

  // test('Invalid OTP when MFA enabled', async ({ apiClient, settings }) => {
  //   const credentials = authCredentialsOrSkip(settings);
  //   const response = await apiClient.auth.login({
  //     orgName: settings.orgName ?? '',
  //     identity: credentials.identity,
  //     password: credentials.password,
  //     otp_code: '000000',
  //   });

  //   if (response.status() === 400) {
  //     const parsed = LoginErrorSchema.safeParse(await response.json());
  //     expect(parsed.success, `Invalid error response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
  //     if (parsed.success) {
  //       expect(parsed.data.message).toBeTruthy();
  //     }
  //   }
  // });

  test('OTP provided when MFA disabled', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: credentials.password,
      otp_code: '123456',
    });

    if (response.status() === 400) {
      const parsed = LoginErrorSchema.safeParse(await response.json());
      expect(parsed.success, `Invalid error response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
      if (parsed.success) {
        expect(parsed.data.message).toBeTruthy();
      }
    }
  });

  test('Extra fields in request', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.post('/login', {
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: credentials.password,
      otp_code: '123456',
      test: 'extra_field',
    });

    expect([400, 422]).toContain(response.status());
  });
  test('OTP with 7 digits (too long)', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    test.skip(!credentials.otpSecret, 'Requires MFA-enabled account');
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: credentials.password,
      otp_code: '1234567',
    });

    expect([400, 422]).toContain(response.status());
  });

  test('OTP with 5 digits (too short)', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    test.skip(!credentials.otpSecret, 'Requires MFA-enabled account');
    const response = await apiClient.auth.login({
      orgName: settings.orgName ?? '',
      identity: credentials.identity,
      password: credentials.password,
      otp_code: '12345',
    });

    expect([400, 422]).toContain(response.status());
  });
});
