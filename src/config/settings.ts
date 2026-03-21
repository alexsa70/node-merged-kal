import dotenv from 'dotenv';
import { getEnvData, EnvData } from './environments';

dotenv.config();

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

type AuthCredentials = {
  identity: string;
  password: string;
  otpSecret?: string;
};

function env(name: string): string | undefined {
  return process.env[name];
}

function envNumber(name: string, fallback: number): number {
  const value = env(name);
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const value = env(name);
  if (!value) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

function readCreds(prefix: string): AuthCredentials | undefined {
  const identity = env(`${prefix}.EMAIL`);
  const password = env(`${prefix}.PASSWORD`);
  if (!identity || !password) {
    return undefined;
  }
  return {
    identity,
    password,
    otpSecret: env(`${prefix}.OTP_SECRET`),
  };
}

export type AppSettings = {
  profile: string;
  environment: string;
  envData: EnvData;
  apiHttpClient: {
    url: string;
    timeoutMs: number;
  };
  authCredentials?: AuthCredentials;
  authCredentialsSuperAdmin?: AuthCredentials;
  authCredentialsAdmin?: AuthCredentials;
  authCredentialsUser?: AuthCredentials;
  orgName?: string;
  orgRoleId?: string;
  userName?: string;
  userId?: string;
  userRoleId?: string;
  userBaseUrl?: string;
  e2e: {
    baseUrl?: string;
    browserName: BrowserName;
    headless: boolean;
    slowMoMs: number;
    defaultTimeoutMs: number;
  };
};

export type { EnvData };

export function getSettings(): AppSettings {
  const environment = env('ENVIRONMENT') ?? 'qa';
  return {
    profile: env('PROFILE') ?? 'api',
    environment,
    envData: getEnvData(environment),
    apiHttpClient: {
      url: env('API_HTTP_CLIENT.URL') ?? 'https://api.example.com',
      timeoutMs: envNumber('API_HTTP_CLIENT.TIMEOUT', 30) * 1000,
    },
    authCredentials: readCreds('AUTH_CREDENTIALS'),
    authCredentialsSuperAdmin: readCreds('AUTH_CREDENTIALS_SUPER_ADMIN'),
    authCredentialsAdmin: readCreds('AUTH_CREDENTIALS_ADMIN'),
    authCredentialsUser: readCreds('AUTH_CREDENTIALS_USER'),
    orgName: env('ORG_NAME'),
    orgRoleId: env('ORG_ROLE_ID'),
    userName: env('USER_NAME'),
    userId: env('USER_ID'),
    userRoleId: env('USER_ROLE_ID'),
    userBaseUrl: env('USER_BASE_URL'),
    e2e: {
      baseUrl: env('E2E_BASE_URL'),
      browserName: (env('E2E_BROWSER_NAME') as BrowserName) ?? 'chromium',
      headless: envBool('E2E_HEADLESS', true),
      slowMoMs: envNumber('E2E_SLOW_MO_MS', 0),
      defaultTimeoutMs: envNumber('E2E_DEFAULT_TIMEOUT_MS', 30000),
    },
  };
}
