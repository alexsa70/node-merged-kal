import { APIResponse } from '@playwright/test';
import { BaseClient } from '../baseClient';
import { AuthRoutes } from '../../tools/routes';
import { LoginRequest, ResetPasswordRequest, SSOLoginRequest } from '../../schema/operations';

export class AuthClient extends BaseClient {
  async login(payload: LoginRequest): Promise<APIResponse> {
    return this.post(AuthRoutes.LOGIN, payload);
  }

  async ssoLogin(payload: SSOLoginRequest): Promise<APIResponse> {
    return this.post(AuthRoutes.SSO_LOGIN, payload);
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<APIResponse> {
    return this.post(AuthRoutes.RESET_PASSWORD, payload);
  }

  async createSessionToken(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(AuthRoutes.SESSION_TOKEN, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async refreshSessionToken(payload: Record<string, unknown>): Promise<APIResponse> {
    return this.post(AuthRoutes.REFRESH_SESSION_TOKEN, payload);
  }
}
