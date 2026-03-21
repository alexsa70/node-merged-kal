import { APIResponse } from '@playwright/test';
import { BaseClient } from '../baseClient';
import { ProjectRoutes } from '../../tools/routes';
import { EnvData } from '../../config/environments';
import { step } from '../../tools/allure';

export type ProjectTypeName = 'KalDocs' | 'KalAudio' | 'KalMedia' | 'KalTables';

type ProjectConfig = {
  projectTypeId: string;
  productId: string;
  settings: Record<string, unknown>;
};

function buildProjectConfig(typeName: ProjectTypeName, envData: EnvData): ProjectConfig {
  const mediaSettings = {
    ai_description: {},
    embedding: {},
    face_recognition: {},
    info_extractor: {},
    ocr: {},
    tags: {},
    thumbnail: {},
  };
  const defaultSettings = { embedding: {}, summary: { prompt: '' }, topic: {} };

  const configs: Record<ProjectTypeName, ProjectConfig> = {
    KalDocs: {
      projectTypeId: envData.projectTypeIds.structured,
      productId: envData.productIds.kalDocs,
      settings: defaultSettings,
    },
    KalAudio: {
      projectTypeId: envData.projectTypeIds.file,
      productId: envData.productIds.kalAudio,
      settings: defaultSettings,
    },
    KalTables: {
      projectTypeId: envData.projectTypeIds.table,
      productId: envData.productIds.table,
      settings: defaultSettings,
    },
    KalMedia: {
      projectTypeId: envData.projectTypeIds.media,
      productId: envData.productIds.kalMedia,
      settings: mediaSettings,
    },
  };

  return configs[typeName];
}

export class ProjectClient extends BaseClient {
  async createProject(params: {
    orgId: string;
    token: string;
    envData: EnvData;
    typeName?: ProjectTypeName;
    name?: string;
  }): Promise<APIResponse> {
    const { orgId, token, envData, typeName = 'KalDocs', name } = params;
    const config = buildProjectConfig(typeName, envData);
    const timestamp = new Date().toTimeString().slice(0, 8);
    const suffix = Math.random().toString(36).slice(2, 8);

    return step(`Create project [${typeName}]`, async () => {
      return this.post(
        ProjectRoutes.CREATE,
        {
          name: name ?? `auto_${typeName}_${timestamp}_${suffix}`,
          product_name: typeName,
          org_id: orgId,
          project_type_id: config.projectTypeId,
          product_id: config.productId,
          description: 'Automation test project',
          settings: config.settings,
        },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async getProject(params: { orgId: string; projectId: string; token: string }): Promise<APIResponse> {
    const { orgId, projectId, token } = params;
    return step(`Get project: ${projectId}`, async () => {
      return this.post(
        ProjectRoutes.GET,
        { org_id: orgId, project_id: projectId },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async updateProject(params: { orgId: string; projectId: string; token: string }): Promise<APIResponse> {
    const { orgId, projectId, token } = params;
    return step(`Update project: ${projectId}`, async () => {
      return this.post(
        ProjectRoutes.UPDATE,
        {
          org_id: orgId,
          project_id: projectId,
          name: 'Project Updated By Automation',
          description: 'Updated by automation test',
        },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async deleteProject(params: { orgId: string; projectId: string; token: string }): Promise<APIResponse> {
    const { orgId, projectId, token } = params;
    return step(`Delete project: ${projectId}`, async () => {
      return this.post(
        ProjectRoutes.DELETE,
        { org_id: orgId, project_id: projectId },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async getAllProjects(params: { orgId: string; token: string }): Promise<APIResponse> {
    const { orgId, token } = params;
    return step('Get all projects', async () => {
      return this.post(
        ProjectRoutes.GET_ALL,
        { org_id: orgId },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }

  async changeProjectUsers(params: {
    orgId: string;
    projectId: string;
    token: string;
    users: Array<{ id: string; email: string }>;
  }): Promise<APIResponse> {
    const { orgId, projectId, token, users } = params;
    return step('Change project users', async () => {
      return this.post(
        ProjectRoutes.CHANGE_USERS,
        { org_id: orgId, project_id: projectId, users_list: users },
        undefined,
        undefined,
        { Authorization: `Bearer ${token}` },
      );
    });
  }
}
