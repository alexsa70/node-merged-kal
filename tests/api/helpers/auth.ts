import { authenticator } from 'otplib';
import { test } from '../fixtures';
import type { AppSettings } from '../../../src/config/settings';
import type { LoginRequest } from '../../../src/schema/operations';

export type AuthCredentials = NonNullable<AppSettings['authCredentials']>;

export function authCredentialsOrSkip(settings: AppSettings): AuthCredentials {
  const credentials = settings.authCredentials;
  test.skip(!credentials, 'AUTH_CREDENTIALS are not configured in .env');
  if (!credentials) {
    throw new Error('AUTH_CREDENTIALS are not configured in .env');
  }
  return credentials;
}

export function makeLoginPayload(
  settings: AppSettings,
  credentials: AuthCredentials,
  otpCode?: string,
): LoginRequest {
  const code = otpCode ?? (credentials.otpSecret
    ? authenticator.generate(credentials.otpSecret)
    : undefined);

  return {
    orgName: settings.orgName ?? '',
    identity: credentials.identity,
    password: credentials.password,
    otp_code: code,
  };
}
