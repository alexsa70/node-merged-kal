import fs from 'fs';
import path from 'path';
import { APIResponse } from '@playwright/test';
import { BaseClient } from '../baseClient';
import { FileRoutes } from '../../tools/routes';
import { step } from '../../tools/allure';

export class FileClient extends BaseClient {
  async uploadFile(params: {
    filePath: string;
    orgId: string;
    projectId: string;
    product: string;
    token: string;
  }): Promise<APIResponse> {
    const { filePath, orgId, projectId, product, token } = params;
    const fileName = path.basename(filePath);
    const buffer = fs.readFileSync(filePath);
    const mimeType = resolveMimeType(filePath);

    return step(`Upload file: ${fileName}`, async () => {
      return this.post(
        FileRoutes.UPLOAD,
        undefined,
        { org_id: orgId, project_id: projectId, name: fileName, product },
        { file: { filename: fileName, buffer, contentType: mimeType } },
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async getFile(params: { orgId: string; projectId: string; fileId: string; token: string }): Promise<APIResponse> {
    const { orgId, projectId, fileId, token } = params;
    return step(`Get file: ${fileId}`, async () => {
      return this.post(
        FileRoutes.GET,
        { org_id: orgId, project_id: projectId, file_id: fileId },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async getAllFiles(params: { orgId: string; projectIds: string[]; token: string }): Promise<APIResponse> {
    const { orgId, projectIds, token } = params;
    return step('Get all files', async () => {
      return this.post(
        FileRoutes.GET_ALL,
        { org_id: orgId, project_ids: projectIds },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async getAllFilesV2(params: { orgId: string; projectIds: string[]; token: string }): Promise<APIResponse> {
    const { orgId, projectIds, token } = params;
    return step('Get all files v2', async () => {
      return this.post(
        FileRoutes.GET_ALL_V2,
        { org_id: orgId, project_ids: projectIds, limit: 50 },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async deleteFile(params: { orgId: string; projectId: string; fileId: string; token: string }): Promise<APIResponse> {
    const { orgId, projectId, fileId, token } = params;
    return step(`Delete file: ${fileId}`, async () => {
      return this.post(
        FileRoutes.DELETE,
        { org_id: orgId, files_project: [{ project_id: projectId, file_ids: [fileId] }] },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }
}

function resolveMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeMap[ext] ?? 'application/octet-stream';
}
