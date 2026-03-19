import fs from 'fs';
import path from 'path';
import { test as base, request } from '@playwright/test';
import { authenticator } from 'otplib';
import { ApiClient } from '../../src/clients/apiClient';
import { PlaywrightHttpClient } from '../../src/clients/baseClient';
import { getSettings, AppSettings } from '../../src/config/settings';

type AuthState = {
  token?: string;
  reason?: string;
  createdAt: string;
};

const AUTH_STATE_PATH = path.join(process.cwd(), '.auth', 'default-token.json');

type RoleTokens = Partial<Record<'super_admin' | 'admin' | 'user', string>>;

type Fixtures = {
  settings: AppSettings;
  apiClient: ApiClient;
  authState: AuthState;
  authToken: string;
  tokensByRole: RoleTokens;
};

function readAuthState(): AuthState {
  if (!fs.existsSync(AUTH_STATE_PATH)) {
    return { reason: 'Auth state file not found. Run tests again.', createdAt: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(AUTH_STATE_PATH, 'utf-8')) as AuthState;
}

export const test = base.extend<Fixtures>({
  settings: async ({}, use) => {
    await use(getSettings());
  },

  apiClient: async ({ settings }, use) => {
    const context = await request.newContext({
      baseURL: settings.apiHttpClient.url,
      timeout: settings.apiHttpClient.timeoutMs,
      ignoreHTTPSErrors: true,
    });
    await use(new ApiClient(new PlaywrightHttpClient(context)));
    await context.dispose();
  },

  authState: async ({}, use) => {
    await use(readAuthState());
  },

  authToken: async ({ authState }, use) => {
    await use(authState.token ?? '');
  },

  tokensByRole: async ({}, use) => {
    const settings = getSettings();
    const roleTokens: RoleTokens = {};
    const context = await request.newContext({
      baseURL: settings.apiHttpClient.url,
      timeout: settings.apiHttpClient.timeoutMs,
      ignoreHTTPSErrors: true,
    });

    const roleConfigs = {
      super_admin: settings.authCredentialsSuperAdmin,
      admin: settings.authCredentialsAdmin,
      user: settings.authCredentialsUser,
    } as const;

    for (const [role, creds] of Object.entries(roleConfigs) as Array<[
      keyof typeof roleConfigs,
      typeof roleConfigs[keyof typeof roleConfigs]
    ]>) {
      if (!creds) {
        continue;
      }

      const otpCode = creds.otpSecret ? authenticator.generate(creds.otpSecret) : undefined;
      const response = await context.post('/login', {
        data: {
          orgName: settings.orgName ?? '',
          identity: creds.identity,
          password: creds.password,
          otp_code: otpCode,
        },
        failOnStatusCode: false,
      });

      if (response.status() !== 200) {
        continue;
      }

      const body = (await response.json()) as Record<string, unknown>;
      if (typeof body.token === 'string') {
        roleTokens[role] = body.token;
      }
    }

    await use(roleTokens);
    await context.dispose();
  },
});

export const expect = test.expect;

export function requireAuthToken(authState: AuthState): string {
  test.skip(!authState.token, authState.reason ?? 'Auth token is unavailable');
  return authState.token as string;
}

export function tokenForRoles(tokensByRole: RoleTokens, roles: Array<keyof RoleTokens>): string {
  for (const role of roles) {
    if (tokensByRole[role]) {
      return tokensByRole[role] as string;
    }
  }
  test.skip(true, `None of required roles is configured: ${roles.join(', ')}`);
  return '';
}
