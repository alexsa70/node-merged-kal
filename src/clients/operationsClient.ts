import { APIResponse } from '@playwright/test';
import { BaseClient, UploadFile } from './baseClient';
import { AuthRoutes, OrgRoutes, UserRoutes } from '../tools/routes';
import { LoginRequest, ResetPasswordRequest, SSOLoginRequest } from '../schema/operations';

export class APIClient extends BaseClient {
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

  async createOrg(payload: Record<string, unknown>, token: string, logo?: UploadFile): Promise<APIResponse> {
    const files = logo ? { logo } : undefined;
    return this.post(OrgRoutes.ORG_CREATE, undefined, payload, files, { Authorization: `Bearer ${token}` });
  }

  async userRetrieve(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_RETRIEVE, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async userGetById(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_GET_BY_ID, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async userUpdate(payload: Record<string, unknown>, token: string, userImage?: UploadFile): Promise<APIResponse> {
    const files = userImage ? { user_image: userImage } : undefined;
    return this.post(UserRoutes.USER_UPDATE, undefined, payload, files, { Authorization: `Bearer ${token}` });
  }

  async userCreate(payload: Record<string, unknown>, token: string, userImage?: UploadFile): Promise<APIResponse> {
    const files = userImage ? { user_image: userImage } : undefined;
    return this.post(UserRoutes.USER_CREATE, undefined, payload, files, { Authorization: `Bearer ${token}` });
  }

  async userDelete(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_DELETE, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async userGetAll(token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_GET_ALL, {}, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async userGetRoles(token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_GET_ROLES, {}, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async userUnlock(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_UNLOCK, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async userResetMfa(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_RESET_MFA, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }
}
