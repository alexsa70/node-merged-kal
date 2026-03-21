import { test, expect, tokenForRoles } from '../fixtures';

test.describe('Projects CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let projectId: string;

  // ── Positive ───────────────────────────────────────────────────────────────

  test('create project as admin @smoke', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.project.createProject({
      orgId,
      token,
      envData: settings.envData,
      typeName: 'KalDocs',
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as { project_id: string; message: string };
    expect(body.project_id).toBeTruthy();
    expect(body.message).toBe('New project created successfully.');
    projectId = body.project_id;
  });

  test('get project as admin', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.project.getProject({ orgId, projectId, token });
    expect(response.status()).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    for (const field of ['name', 'org_id', 'created_by', 'created_at', 'project_type_id', 'product_id', 'id']) {
      expect(body[field], `field "${field}" missing`).toBeTruthy();
    }
  });

  test('get all projects as admin', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.project.getAllProjects({ orgId, token });
    expect(response.status()).toBe(200);

    const body = (await response.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].id).toBeTruthy();
  });

  test('get all projects as regular user', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['user']);
    const { orgId } = settings.envData;

    const response = await apiClient.project.getAllProjects({ orgId, token });
    expect(response.status()).toBe(200);
  });

  test('update project as admin', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.project.updateProject({ orgId, projectId, token });
    expect(response.status()).toBe(200);
  });

  // ── Negative ───────────────────────────────────────────────────────────────

  test('create project without auth → 401', async ({ apiClient, settings }) => {
    const { orgId, productIds, projectTypeIds } = settings.envData;

    const response = await apiClient.post(
      '/api/project/create',
      {
        name: 'no-auth-project',
        org_id: orgId,
        product_id: productIds.kalDocs,
        project_type_id: projectTypeIds.structured,
        product_name: 'KalDocs',
        description: 'test',
        settings: {},
      },
    );
    expect(response.status()).toBe(401);
    const body = await response.text();
    expect(body).toContain('Authorization token missing');
  });

  test('get project with invalid id → 400', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.project.getProject({ orgId, projectId: 'invalid', token });
    expect(response.status()).toBe(400);
    const body = await response.text();
    expect(body).toContain('invalid');
  });

  for (const action of ['get', 'update', 'delete'] as const) {
    test(`${action} project without auth → 401`, async ({ apiClient, settings }) => {
      const { orgId } = settings.envData;
      const routes: Record<string, string> = {
        get: '/api/project/get',
        update: '/api/project/update',
        delete: '/api/project/delete',
      };
      const response = await apiClient.post(routes[action], { org_id: orgId, project_id: projectId });
      expect(response.status()).toBe(401);
      const body = await response.text();
      expect(body).toContain('Authorization token missing');
    });
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  test('delete project as admin', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.project.deleteProject({ orgId, projectId, token });
    expect(response.status()).toBe(200);
  });
});
