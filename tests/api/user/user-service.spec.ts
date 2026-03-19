import { test, expect, tokenForRoles } from '../fixtures';
import { fakeEmail, fakeFirstName, fakeLastName, fakeUsername } from '../../../src/tools/fakers';

test.describe('User Service', () => {
  test('retrieve user by name', async ({ apiClient, tokensByRole, settings }) => {
    test.skip(!settings.userName, 'USER_NAME is not configured in .env');
    const token = tokenForRoles(tokensByRole, ['admin', 'user']);
    const response = await apiClient.user.retrieve({ user_name: settings.userName }, token);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.user_name).toBe(settings.userName);
  });

  test('get user by id', async ({ apiClient, tokensByRole, settings }) => {
    test.skip(!settings.userId, 'USER_ID is not configured in .env');
    const token = tokenForRoles(tokensByRole, ['admin', 'user']);
    const response = await apiClient.user.getById({ user_id: settings.userId }, token);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.id).toBe(settings.userId);
  });

  test('get all users', async ({ apiClient, tokensByRole }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const response = await apiClient.user.getAll(token);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(Number(body.total_count)).toBeGreaterThanOrEqual(0);
  });

  test('get roles', async ({ apiClient, tokensByRole }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'user']);
    const response = await apiClient.user.getRoles(token);

    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    const roles = body.roles as Array<unknown>;
    expect(roles.length).toBeGreaterThan(0);
  });

  test('unlock non-existing user -> 404', async ({ apiClient, tokensByRole }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const response = await apiClient.user.unlock({ username: 'nonexistent_user_qa_12345' }, token);

    expect(response.status()).toBe(404);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.message).toBeTruthy();
  });

  test('reset MFA non-existing user -> 404', async ({ apiClient, tokensByRole }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const response = await apiClient.user.resetMfa({ user_id: '000000000000000000000000' }, token);

    expect(response.status()).toBe(404);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.message).toBeTruthy();
  });

  test('create and delete user', async ({ apiClient, tokensByRole, settings }) => {
    test.skip(!settings.orgName, 'ORG_NAME is not configured in .env');
    const roleId = settings.userRoleId ?? settings.orgRoleId;
    test.skip(!roleId, 'USER_ROLE_ID/ORG_ROLE_ID is not configured in .env');

    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);

    const createPayload = {
      org_name: settings.orgName,
      user_name: `qa-${fakeUsername()}`,
      first_name: fakeFirstName(),
      last_name: fakeLastName(),
      role_id: roleId,
      email: fakeEmail(),
      is_ldap_sso_user: 'false',
      base_url: settings.userBaseUrl,
    };

    const createResponse = await apiClient.user.create(createPayload, token);
    expect(createResponse.status()).toBe(200);

    const createBody = (await createResponse.json()) as Record<string, unknown>;
    const userId = String(createBody.user_id);

    const deleteResponse = await apiClient.user.remove({ user_id: userId }, token);
    expect(deleteResponse.status()).toBe(200);
  });

  test('update user', async ({ apiClient, tokensByRole, settings }) => {
    test.skip(!settings.userId, 'USER_ID is not configured in .env');
    const token = tokenForRoles(tokensByRole, ['admin']);

    const response = await apiClient.user.update(
      {
        user_id: settings.userId,
        first_name: `QA${fakeFirstName()}`,
      },
      token,
    );
    expect(response.status()).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(String(body.id)).toBe(settings.userId);
  });

  test('delete non-existing user -> 404', async ({ apiClient, tokensByRole }) => {
    const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
    const response = await apiClient.user.remove({ user_id: '000000000000000000000000' }, token);
    expect(response.status()).toBe(404);
  });
});
