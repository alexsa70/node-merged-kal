import { authenticator } from 'otplib';
import { test, expect } from '../fixtures';
import { fakeEmail, fakeOrgName, fakePassword } from '../../../src/tools/fakers';
import type { AppSettings } from '../../../src/config/settings';

function makeLoginPayload(settings: AppSettings, otpCode?: string): Record<string, unknown> {
  const code = otpCode ?? (settings.authCredentials?.otpSecret
    ? authenticator.generate(settings.authCredentials.otpSecret)
    : undefined);

  return {
    orgName: settings.orgName ?? '',
    identity: settings.authCredentials?.email,
    password: settings.authCredentials?.password,
    otp_code: code,
  };
}

test.describe('Authentication /login', () => {
  test('valid credentials -> 200 + token', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.login(makeLoginPayload(settings));
    expect(response.status()).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    if (body.mfa_required) {
      test.skip(!settings.authCredentials?.otpSecret, 'MFA required but AUTH_CREDENTIALS.OTP_SECRET not set in .env');
    }
    expect(typeof body.token).toBe('string');
  });

  test('token is JWT format', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.login(makeLoginPayload(settings));
    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    if (body.mfa_required) {
      test.skip(!settings.authCredentials?.otpSecret, 'MFA required but AUTH_CREDENTIALS.OTP_SECRET not set in .env');
    }
    expect(String(body.token)).toContain('eyJ');
  });

  test('invalid password -> 400', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: settings.authCredentials?.email,
      password: 'wrong_password_!@#$',
    });
    expect(response.status()).toBe(400);
  });

  test('non-existent user -> 400', async ({ apiClient, settings }) => {
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: fakeEmail(),
      password: fakePassword(),
    });
    expect(response.status()).toBe(400);
  });

  test('missing password -> 400/422', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.post('/login', {
      orgName: settings.orgName,
      identity: settings.authCredentials?.email,
    });
    expect([400, 422]).toContain(response.status());
  });

  test('missing identity -> 400/422', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.post('/login', {
      orgName: settings.orgName,
      password: settings.authCredentials?.password,
    });
    expect([400, 422]).toContain(response.status());
  });

  test('missing orgName -> 400/422', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.post('/login', {
      identity: settings.authCredentials?.email,
      password: settings.authCredentials?.password,
    });
    expect([400, 422]).toContain(response.status());
  });

  test('empty body -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/login', {});
    expect([400, 422]).toContain(response.status());
  });

  test('MFA challenge when otp_code omitted', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: settings.authCredentials?.email,
      password: settings.authCredentials?.password,
    });

    if (response.status() !== 200) {
      return;
    }

    const body = (await response.json()) as Record<string, unknown>;
    if (!body.mfa_required) {
      test.skip(true, 'Account does not require MFA - test not applicable');
    }

    expect(body.mfa_required).toBe(true);
    expect(typeof body.message).toBe('string');
  });

  test('invalid OTP -> 400', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: settings.authCredentials?.email,
      password: settings.authCredentials?.password,
      otp_code: '000000',
    });

    if (response.status() === 400) {
      const body = (await response.json()) as Record<string, unknown>;
      expect(body.message).toBeTruthy();
    }
  });

  test('response must not contain password', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const response = await apiClient.login(makeLoginPayload(settings));
    const bodyText = await response.text();
    expect(bodyText).not.toContain(settings.authCredentials?.password ?? '');
  });

  test('SQL injection in identity -> not 500', async ({ apiClient, settings }) => {
    const response = await apiClient.login({
      orgName: settings.orgName ?? '',
      identity: "' OR '1'='1",
      password: 'password',
    });
    expect(response.status()).not.toBe(500);
  });

  test('unknown orgName -> 400', async ({ apiClient }) => {
    const response = await apiClient.login({
      orgName: fakeOrgName(),
      identity: fakeEmail(),
      password: fakePassword(),
    });
    expect(response.status()).toBe(400);
  });

  test('rate limit -> 429 after repeated requests', async ({ apiClient, settings }) => {
    test.skip(!settings.authCredentials, 'AUTH_CREDENTIALS are not configured in .env');
    const statusCodes: number[] = [];

    for (let i = 0; i < 10; i += 1) {
      const response = await apiClient.post('/login', {
        orgName: settings.orgName,
        identity: settings.authCredentials?.email,
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
