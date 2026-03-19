import { APIResponse } from '@playwright/test';
import { BaseClient, UploadFile } from '../baseClient';
import { OrgRoutes } from '../../tools/routes';

export class OrgClient extends BaseClient {
  async create(payload: Record<string, unknown>, token: string, logo?: UploadFile): Promise<APIResponse> {
    const files = logo ? { logo } : undefined;
    return this.post(OrgRoutes.ORG_CREATE, undefined, payload, files, { Authorization: `Bearer ${token}` });
  }

  async getById(payload: Record<string, unknown>, token: string): Promise<APIResponse> {
    return this.post(OrgRoutes.ORG_GET, payload, undefined, undefined, { Authorization: `Bearer ${token}` });
  }
}
