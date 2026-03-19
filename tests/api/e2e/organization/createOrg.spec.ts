import { test, expect } from '../../fixtures';
import { fakeDomain, fakeEmail, fakeFirstName, fakeLastName, fakeOrgName, fakeUsername } from '../../../../src/tools/fakers';
import type { AppSettings } from '../../../../src/config/settings';

const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

function baseOrgPayload(settings: AppSettings): Record<string, unknown> {
  return {
    org_name: fakeOrgName(),
    domain: fakeDomain(),
    admin_email: fakeEmail(),
    user_name: fakeUsername(),
    first_name: fakeFirstName(),
    last_name: fakeLastName(),
    role_id: settings.orgRoleId ?? '507f1f77bcf86cd799439022',
  };
}

test.describe('E2E: Organization lifecycle', () => {
  test.describe.configure({ mode: 'serial' });

  let orgId: string;

  test('Create Organization as Super Admin', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokensByRole.super_admin;
    test.skip(!token, 'AUTH_CREDENTIALS_SUPER_ADMIN not configured');
    if (!token) return;

    const response = await apiClient.org.create(baseOrgPayload(settings), token);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.org_id).toBeTruthy();
    orgId = body.org_id as string;
  });

  test('Get created organization', async ({ apiClient, tokensByRole }) => {
    const token = tokensByRole.super_admin;
    test.skip(!token, 'AUTH_CREDENTIALS_SUPER_ADMIN not configured');
    test.skip(!orgId, 'org_id not available – previous test failed');
    if (!token || !orgId) return;

    const response = await apiClient.org.getById({ org_id: orgId }, token);
    expect(response.status()).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.org_id).toBe(orgId);
  });

  test('Create Organization with PNG logo', async ({ apiClient, tokensByRole, settings }) => {
    const token = tokensByRole.super_admin;
    test.skip(!token, 'AUTH_CREDENTIALS_SUPER_ADMIN not configured');
    if (!token) return;

    const response = await apiClient.org.create(baseOrgPayload(settings), token, {
      filename: 'logo.png',
      buffer: PNG_BYTES,
      contentType: 'image/png',
    });
    expect(response.status()).toBe(200);
  });
});
