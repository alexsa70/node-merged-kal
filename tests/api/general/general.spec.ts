import { test, expect, tokenForRoles } from '../fixtures';

test.describe('General APIs', () => {
  test('get available LLMs @smoke', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin', 'user']);
    const { orgId } = settings.envData;

    const response = await apiClient.general.getAvailableLlms(orgId, token);
    expect(response.status()).toBe(200);
  });

  test('get all automations', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.general.getAllAutomations(orgId, token);
    expect(response.status()).toBe(200);
  });

  test('get all project types', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.general.getAllProjectTypes(orgId, token);
    expect(response.status()).toBe(200);
  });

  test('get roles', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const { orgId } = settings.envData;

    const response = await apiClient.general.getRoles(orgId, token);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as { roles?: unknown[] };
    expect(Array.isArray(body.roles ?? body)).toBe(true);
  });

  test('get user conversations', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin', 'user']);
    const { orgId } = settings.envData;

    const response = await apiClient.general.getUserConversations(orgId, token);
    expect(response.status()).toBe(200);
  });
});
