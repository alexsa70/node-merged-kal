import fs from 'fs';
import path from 'path';
import { APIRequestContext, request } from '@playwright/test';
import { authenticator } from 'otplib';
import { ApiClient } from '../../../src/clients/apiClient';
import { PlaywrightHttpClient } from '../../../src/clients/baseClient';
import { AppSettings } from '../../../src/config/settings';
import { ProjectTypeName } from '../../../src/clients/resources/projectClient';

type SupportedRole = 'admin' | 'user' | 'super_admin';

type CreateProjectResult = {
  projectId: string;
  projectName: string;
};

export class E2eApiSession {
  private constructor(
    private readonly context: APIRequestContext,
    readonly apiClient: ApiClient,
    readonly settings: AppSettings,
  ) {}

  static async create(settings: AppSettings): Promise<E2eApiSession> {
    const context = await request.newContext({
      baseURL: settings.apiHttpClient.url,
      timeout: settings.apiHttpClient.timeoutMs,
      ignoreHTTPSErrors: true,
    });

    return new E2eApiSession(context, new ApiClient(new PlaywrightHttpClient(context)), settings);
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }

  async tokenForRole(role: SupportedRole): Promise<string> {
    const creds = role === 'admin'
      ? this.settings.authCredentialsAdmin
      : role === 'user'
        ? this.settings.authCredentialsUser
        : this.settings.authCredentialsSuperAdmin;

    if (!creds) {
      throw new Error(`Credentials for role "${role}" are not configured`);
    }

    const otpCode = creds.otpSecret ? authenticator.generate(creds.otpSecret) : undefined;
    const response = await this.apiClient.auth.login({
      orgName: this.settings.orgName ?? '',
      identity: creds.identity,
      password: creds.password,
      otp_code: otpCode,
    });

    if (response.status() !== 200) {
      const body = await response.text();
      throw new Error(`Failed to login as ${role}: ${response.status()} ${body}`);
    }

    const body = (await response.json()) as Record<string, unknown>;
    if (typeof body.token !== 'string') {
      throw new Error(`Token is missing in login response for ${role}`);
    }
    return body.token;
  }

  async createProject(role: SupportedRole, typeName: ProjectTypeName, namePrefix: string): Promise<CreateProjectResult> {
    const token = await this.tokenForRole(role);
    const projectName = `${namePrefix}_${Math.random().toString(36).slice(2, 8)}`;
    const response = await this.apiClient.project.createProject({
      orgId: this.settings.envData.orgId,
      token,
      envData: this.settings.envData,
      typeName,
      name: projectName,
    });

    if (response.status() !== 200) {
      const body = await response.text();
      throw new Error(`Failed to create project: ${response.status()} ${body}`);
    }

    const body = (await response.json()) as { project_id?: string };
    if (!body.project_id) {
      throw new Error('project_id is missing in create project response');
    }

    return {
      projectId: body.project_id,
      projectName,
    };
  }

  async deleteProject(role: SupportedRole, projectId: string): Promise<void> {
    const token = await this.tokenForRole(role);
    await this.apiClient.project.deleteProject({
      orgId: this.settings.envData.orgId,
      projectId,
      token,
    });
  }

  async uploadFile(role: SupportedRole, params: {
    fileName: string;
  }): Promise<void> {
    const filePath = resolveFixtureFile(params.fileName);
    if (!filePath) {
      throw new Error(`Fixture file not found: ${params.fileName}`);
    }

    const token = await this.tokenForRole(role);
    const response = await this.apiClient.file.uploadManualFile({
      filePath,
      orgId: this.settings.envData.orgId,
      token,
    });

    if (response.status() !== 200) {
      const body = await response.text();
      throw new Error(`Failed to upload file "${params.fileName}": ${response.status()} ${body}`);
    }
  }
}

export function resolveFixtureFile(fileName: string): string | undefined {
  const candidates = [
    path.join(process.cwd(), 'assets', 'files', fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}
