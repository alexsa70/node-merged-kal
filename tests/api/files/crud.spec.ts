import path from 'path';
import { test, expect, tokenForRoles } from '../fixtures';

// Путь к тестовым файлам (лежат в assets/files/ рядом с проектом или в node-playwright/assets)
const ASSETS_DIR = path.join(process.cwd(), 'assets', 'files');
const TEST_PDF = path.join(ASSETS_DIR, 'test.pdf');

test.describe('Files CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let projectId: string;
  let fileId: string;

  // ── Setup: create project ─────────────────────────────────────────────────

  test.beforeAll(async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const res = await apiClient.project.createProject({
      orgId,
      token,
      envData: settings.envData,
      typeName: 'KalDocs',
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { project_id: string };
    projectId = body.project_id;
  });

  // ── Teardown: delete project ──────────────────────────────────────────────

  test.afterAll(async ({ apiClient, tokensByRole, settings }) => {
    if (!projectId) return;
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    await apiClient.project.deleteProject({ orgId: settings.envData.orgId, projectId, token });
  });

  // ── Admin ─────────────────────────────────────────────────────────────────

  test.describe('Admin', () => {
    test('upload file as admin @smoke', async ({ apiClient, tokensByRole, settings }) => {
      test.skip(!require('fs').existsSync(TEST_PDF), `Test file not found: ${TEST_PDF}`);

      const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const { orgId } = settings.envData;

      const response = await apiClient.file.uploadFile({
        filePath: TEST_PDF,
        orgId,
        projectId,
        product: 'KalDocs',
        token,
      });

      expect(response.status()).toBe(200);
      const body = (await response.json()) as { file_id: string };
      expect(body.file_id).toBeTruthy();
      fileId = body.file_id;
    });

    test('get file as admin', async ({ apiClient, tokensByRole, settings }) => {
      test.skip(!fileId, 'fileId not set — upload test may have been skipped');
      const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const { orgId } = settings.envData;

      const response = await apiClient.file.getFile({ orgId, projectId, fileId, token });
      expect(response.status()).toBe(200);
    });

    test('get all files as admin', async ({ apiClient, tokensByRole, settings }) => {
      const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const { orgId } = settings.envData;

      const response = await apiClient.file.getAllFiles({ orgId, projectIds: [projectId], token });
      expect(response.status()).toBe(200);
    });

    test('get all files v2 as admin', async ({ apiClient, tokensByRole, settings }) => {
      const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const { orgId } = settings.envData;

      const response = await apiClient.file.getAllFilesV2({ orgId, projectIds: [projectId], token });
      expect(response.status()).toBe(200);
    });

    test('delete file as admin', async ({ apiClient, tokensByRole, settings }) => {
      test.skip(!fileId, 'fileId not set — upload test may have been skipped');
      const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const { orgId } = settings.envData;

      const response = await apiClient.file.deleteFile({ orgId, projectId, fileId, token });
      expect(response.status()).toBe(200);
    });
  });
});
