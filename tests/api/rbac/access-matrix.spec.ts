import { test, expect } from '../fixtures';
import { ACCESS_POLICY } from './policy';
import type { AppSettings } from '../../../src/config/settings';

function resolvePlaceholders(value: unknown, settings: AppSettings): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => resolvePlaceholders(item, settings));
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolvePlaceholders(v, settings)]);
    return Object.fromEntries(entries);
  }

  const placeholders: Record<string, string | undefined> = {
    '$USER_NAME': settings.userName,
    '$USER_ID': settings.userId,
    '$ORG_NAME': settings.orgName,
    '$USER_ROLE_ID': settings.userRoleId ?? settings.orgRoleId,
    '$USER_BASE_URL': settings.userBaseUrl,
  };

  if (typeof value === 'string' && value in placeholders) {
    const resolved = placeholders[value];
    test.skip(!resolved, `${value.slice(1)} is not configured in .env`);
    return resolved;
  }

  return value;
}

test.describe('RBAC access matrix', () => {
  for (const rule of ACCESS_POLICY) {
    test(rule.name, async ({ apiClient, tokensByRole, settings }) => {
      const jsonBody = resolvePlaceholders(rule.jsonBody, settings) as Record<string, unknown> | undefined;
      const data = resolvePlaceholders(rule.data, settings) as Record<string, unknown> | undefined;
      const params = resolvePlaceholders(rule.params, settings) as Record<string, string | number | boolean> | undefined;

      for (const role of rule.allowedRoles) {
        const token = tokensByRole[role];
        test.skip(!token, `No token configured for role: ${role}`);

        const response = await apiClient.client.request(rule.method, rule.path, {
          json: jsonBody,
          data,
          params,
          headers: { Authorization: `Bearer ${token as string}` },
        });

        expect(response.status()).toBe(rule.expectedAllowedStatus ?? 200);
      }

      for (const role of rule.deniedRoles) {
        const token = tokensByRole[role];
        test.skip(!token, `No token configured for role: ${role}`);

        const response = await apiClient.client.request(rule.method, rule.path, {
          json: jsonBody,
          data,
          params,
          headers: { Authorization: `Bearer ${token as string}` },
        });

        expect(response.status()).toBe(rule.expectedDeniedStatus ?? 403);
        const text = (await response.text()).toLowerCase();
        expect(text.includes('access') || text.includes('forbidden')).toBeTruthy();
      }
    });
  }
});
