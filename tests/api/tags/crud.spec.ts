import { test, expect, tokenForRoles } from '../fixtures';

test.describe('Tags CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let tagId: string;
  const tagName = `auto_tag_${Date.now()}`;

  // ── Admin ──────────────────────────────────────────────────────────────────

  test.describe('Admin', () => {
    test('create tag as admin @smoke', async ({ apiClient, tokensByRole, settings }) => {
      const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const orgId = settings.envData.orgId;

      const response = await apiClient.tag.createTag(orgId, tagName);
      expect(response.status()).toBe(200);

      const id = await apiClient.tag.getTagIdByName(orgId, tagName);
      expect(id).toBeTruthy();
      tagId = id!;
    });

    test('get tags as admin', async ({ apiClient, tokensByRole, settings }) => {
      tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const orgId = settings.envData.orgId;

      const response = await apiClient.tag.getTags(orgId, 'project');
      expect(response.status()).toBe(200);

      const body = (await response.json()) as { tags: Array<{ id: string; name: string }> };
      const found = body.tags?.find((t) => t.id === tagId);
      expect(found).toBeTruthy();
      expect(found?.name).toBe(tagName);
    });

    test('update tag as admin', async ({ apiClient, tokensByRole, settings }) => {
      tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const orgId = settings.envData.orgId;
      const updatedName = `${tagName}_updated`;

      const response = await apiClient.tag.updateTag(orgId, tagId, updatedName);
      expect(response.status()).toBe(200);

      const getResponse = await apiClient.tag.getTags(orgId, 'project');
      const body = (await getResponse.json()) as { tags: Array<{ id: string; name: string }> };
      const found = body.tags?.find((t) => t.id === tagId);
      expect(found?.name).toBe(updatedName);
    });

    test('delete tag as admin', async ({ apiClient, tokensByRole, settings }) => {
      tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const orgId = settings.envData.orgId;
      const tempName = `auto_tag_del_${Date.now()}`;

      // Create
      await apiClient.tag.createTag(orgId, tempName);
      const tempId = await apiClient.tag.getTagIdByName(orgId, tempName);
      expect(tempId).toBeTruthy();

      // Delete
      const delResponse = await apiClient.tag.deleteTags(orgId, tempId!);
      expect(delResponse.status()).toBe(200);

      // Verify removed
      const getResponse = await apiClient.tag.getTags(orgId, 'project');
      const body = (await getResponse.json()) as { tags: Array<{ id: string }> };
      const still = body.tags?.find((t) => t.id === tempId);
      expect(still).toBeUndefined();
    });
  });

  // ── Regular user ──────────────────────────────────────────────────────────

  test.describe('Regular user', () => {
    let userTagId: string;
    const userTagName = `auto_tag_user_${Date.now()}`;

    test('create tag as regular user', async ({ apiClient, tokensByRole, settings }) => {
      tokenForRoles(tokensByRole, ['user']);
      const orgId = settings.envData.orgId;

      const response = await apiClient.tag.createTag(orgId, userTagName);
      expect(response.status()).toBe(200);

      const id = await apiClient.tag.getTagIdByName(orgId, userTagName);
      expect(id).toBeTruthy();
      userTagId = id!;
    });

    test('get tags as regular user', async ({ apiClient, tokensByRole, settings }) => {
      tokenForRoles(tokensByRole, ['user']);
      const orgId = settings.envData.orgId;

      const response = await apiClient.tag.getTags(orgId, 'project');
      expect(response.status()).toBe(200);

      const body = (await response.json()) as { tags: Array<{ id: string }> };
      expect(body.tags?.find((t) => t.id === userTagId)).toBeTruthy();
    });

    test('update tag as regular user', async ({ apiClient, tokensByRole, settings }) => {
      tokenForRoles(tokensByRole, ['user']);
      const orgId = settings.envData.orgId;
      const updatedName = `${userTagName}_updated`;

      const response = await apiClient.tag.updateTag(orgId, userTagId, updatedName);
      expect(response.status()).toBe(200);

      const getResponse = await apiClient.tag.getTags(orgId, 'project');
      const body = (await getResponse.json()) as { tags: Array<{ id: string; name: string }> };
      expect(body.tags?.find((t) => t.id === userTagId)?.name).toBe(updatedName);
    });

    test('delete tag as regular user', async ({ apiClient, tokensByRole, settings }) => {
      tokenForRoles(tokensByRole, ['user']);
      const orgId = settings.envData.orgId;

      const delResponse = await apiClient.tag.deleteTags(orgId, userTagId);
      expect(delResponse.status()).toBe(200);

      const getResponse = await apiClient.tag.getTags(orgId, 'project');
      const body = (await getResponse.json()) as { tags: Array<{ id: string }> };
      expect(body.tags?.find((t) => t.id === userTagId)).toBeUndefined();
    });
  });

  // ── Authorization ─────────────────────────────────────────────────────────

  test.describe('Authorization', () => {
    for (const route of ['/api/tag_description_manager/get_tags', '/api/tag_description_manager/create_tag']) {
      test(`${route} → 401 without token`, async ({ apiClient, settings }) => {
        const response = await apiClient.post(route, { org_id: settings.envData.orgId });
        expect(response.status()).toBe(401);
      });
    }
  });
});
