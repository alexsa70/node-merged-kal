import { test, expect, requireAuthToken } from '../fixtures';
import { fakeDomain, fakeEmail, fakeFirstName, fakeLastName, fakeOrgName, fakeUsername } from '../../../src/tools/fakers';
import type { AppSettings } from '../../../src/config/settings';

const VALID_COLORS = [
  'blue', 'mint', 'green', 'yellow', 'orange', 'red',
  'lightGrey', 'grey', 'black', 'electricBlue', 'royalPurple', 'pink',
];

const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

const GIF_BYTES = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
  0x00, 0x3b,
]);

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

test.describe('Organizations /api/org/create positive', () => {
  test('required fields only -> 200 + org_id', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create(baseOrgPayload(settings), token);
    expect(response.status()).toBe(200);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.message).toBe('Organization created successfully');
    expect(body.org_id).toBeTruthy();
  });

  test('with org_description -> 200', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const payload = { ...baseOrgPayload(settings), org_description: 'Test organization description' };
    const response = await apiClient.org.create(payload, token);
    expect(response.status()).toBe(200);
  });

  for (const color of VALID_COLORS) {
    test(`color=${color} -> 200`, async ({ apiClient, settings, authState }) => {
      const token = requireAuthToken(authState);
      const payload = { ...baseOrgPayload(settings), org_color: color };
      const response = await apiClient.org.create(payload, token);
      expect(response.status()).toBe(200);
    });
  }

  test('default_language=english -> 200', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create({ ...baseOrgPayload(settings), default_language: 'english' }, token);
    expect(response.status()).toBe(200);
  });

  test('default_language=hebrew -> 200', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create({ ...baseOrgPayload(settings), default_language: 'hebrew' }, token);
    expect(response.status()).toBe(200);
  });

  test('PNG logo upload -> 200', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create(baseOrgPayload(settings), token, {
      filename: 'logo.png',
      buffer: PNG_BYTES,
      contentType: 'image/png',
    });
    expect(response.status()).toBe(200);
  });

  test('permissions.files_access.manual_public=true -> 200', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create(
      { ...baseOrgPayload(settings), permissions: JSON.stringify({ files_access: { manual_public: true } }) },
      token,
    );
    expect(response.status()).toBe(200);
  });

  test('permissions.cache valid ttl -> 200', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create(
      {
        ...baseOrgPayload(settings),
        permissions: JSON.stringify({ cache: { user_acl_ttl: 2400, user_acl_refresh_gap_ttl: 1200 } }),
      },
      token,
    );
    expect(response.status()).toBe(200);
  });
});

test.describe('Organizations /api/org/create validation', () => {
  test('duplicate org_name -> 400', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const name = 'duplicate-org-test-fixed';
    await apiClient.org.create({ ...baseOrgPayload(settings), org_name: name }, token);
    const response = await apiClient.org.create({ ...baseOrgPayload(settings), org_name: name }, token);
    expect(response.status()).toBe(400);
  });

  test('org_description > 150 chars -> 422', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create({ ...baseOrgPayload(settings), org_description: 'x'.repeat(151) }, token);
    expect(response.status()).toBe(422);
    const body = (await response.json()) as Record<string, unknown>;
    expect(JSON.stringify(body).toLowerCase()).toContain('150');
  });

  test('org_description exactly 150 chars -> 200', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create({ ...baseOrgPayload(settings), org_description: 'x'.repeat(150) }, token);
    expect(response.status()).toBe(200);
  });

  test('invalid admin_email -> 422', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create({ ...baseOrgPayload(settings), admin_email: 'not-an-email' }, token);
    expect(response.status()).toBe(422);
  });

  test('invalid org_color -> 400/422', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create({ ...baseOrgPayload(settings), org_color: 'neon_rainbow' }, token);
    expect([400, 422]).toContain(response.status());
  });

  test('GIF logo -> 400 invalid format', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create(baseOrgPayload(settings), token, {
      filename: 'logo.gif',
      buffer: GIF_BYTES,
      contentType: 'image/gif',
    });
    expect(response.status()).toBe(400);
  });

  test('cache user_acl_ttl < 900 -> 422', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create(
      { ...baseOrgPayload(settings), permissions: JSON.stringify({ cache: { user_acl_ttl: 899 } }) },
      token,
    );
    expect(response.status()).toBe(422);
  });

  test('refresh_gap >= ttl -> 422', async ({ apiClient, settings, authState }) => {
    const token = requireAuthToken(authState);
    const response = await apiClient.org.create(
      { ...baseOrgPayload(settings), permissions: JSON.stringify({ cache: { user_acl_ttl: 1800, user_acl_refresh_gap_ttl: 1800 } }) },
      token,
    );
    expect(response.status()).toBe(422);
  });

  for (const field of ['org_name', 'domain', 'admin_email', 'user_name', 'first_name', 'last_name', 'role_id']) {
    test(`missing field '${field}' -> 400/422`, async ({ apiClient, settings, authState }) => {
      const token = requireAuthToken(authState);
      const payload = baseOrgPayload(settings);
      delete payload[field as keyof typeof payload];
      const response = await apiClient.post('/api/org/create', undefined, payload, undefined, {
        Authorization: `Bearer ${token}`,
      });
      expect([400, 422]).toContain(response.status());
    });
  }
});

test.describe('Organizations /api/org/create authorization', () => {
  test('no token -> 401', async ({ apiClient, settings }) => {
    const response = await apiClient.post('/api/org/create', undefined, baseOrgPayload(settings));
    expect(response.status()).toBe(401);
  });

  test('invalid token -> 401', async ({ apiClient, settings }) => {
    const response = await apiClient.org.create(baseOrgPayload(settings), 'invalid.token.here');
    expect(response.status()).toBe(401);
  });
});
