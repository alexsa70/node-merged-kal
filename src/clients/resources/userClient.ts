import { APIResponse } from '@playwright/test';
import { BaseClient, UploadFile } from '../baseClient';
import { UserRoutes } from '../../tools/routes';

export class UserClient extends BaseClient {
  async retrieve(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_RETRIEVE, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async getById(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_GET_BY_ID, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async update(payload: Record<string, unknown>, token: string, userImage?: UploadFile): Promise<APIResponse> {
    const files = userImage ? { user_image: userImage } : undefined;
    return this.post(UserRoutes.USER_UPDATE, undefined, payload, files, { Authorization: `Bearer ${token}` });
  }

  async create(payload: Record<string, unknown>, token: string, userImage?: UploadFile): Promise<APIResponse> {
    const files = userImage ? { user_image: userImage } : undefined;
    return this.post(UserRoutes.USER_CREATE, undefined, payload, files, { Authorization: `Bearer ${token}` });
  }

  async remove(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_DELETE, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async getAll(token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_GET_ALL, {}, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async getRoles(token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_GET_ROLES, {}, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async unlock(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_UNLOCK, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }

  async resetMfa(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(UserRoutes.USER_RESET_MFA, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }
}
