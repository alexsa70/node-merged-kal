import fs from 'fs';
import path from 'path';
import { request, FullConfig } from '@playwright/test';
import { authenticator } from 'otplib';
import { getSettings } from './src/config/settings';

type AuthState = {
  token?: string;
  reason?: string;
  createdAt: string;
};

const AUTH_STATE_PATH = path.join(process.cwd(), '.auth', 'default-token.json');

async function globalSetup(_config: FullConfig): Promise<void> {
  const settings = getSettings();
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });

  if (!settings.authCredentials) {
    const state: AuthState = {
      reason: 'AUTH_CREDENTIALS are not configured in .env',
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify(state, null, 2));
    return;
  }

  const context = await request.newContext({
    baseURL: settings.apiHttpClient.url,
    ignoreHTTPSErrors: true,
    timeout: settings.apiHttpClient.timeoutMs,
  });

  const otpCode = settings.authCredentials.otpSecret
    ? authenticator.generate(settings.authCredentials.otpSecret)
    : undefined;

  const response = await context.post('/login', {
    data: {
      orgName: settings.orgName ?? '',
      identity: settings.authCredentials.identity,
      password: settings.authCredentials.password,
      otp_code: otpCode,
    },
    failOnStatusCode: false,
  });

  const bodyText = await response.text();
  let state: AuthState;
  try {
    const body = JSON.parse(bodyText) as Record<string, unknown>;
    if (response.status() === 200 && typeof body.token === 'string') {
      state = { token: body.token, createdAt: new Date().toISOString() };
    } else if (body.mfa_required) {
      state = {
        reason: 'MFA required. Configure AUTH_CREDENTIALS.OTP_SECRET in .env',
        createdAt: new Date().toISOString(),
      };
    } else {
      state = {
        reason: `Auth bootstrap failed: /login returned ${response.status()}`,
        createdAt: new Date().toISOString(),
      };
    }
  } catch {
    state = {
      reason: `Auth bootstrap failed: /login returned ${response.status()}`,
      createdAt: new Date().toISOString(),
    };
  }

  fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify(state, null, 2));
  await context.dispose();
}

export default globalSetup;
