import { test, expect } from '../fixtures';
import { LoginSuccessSchema } from '../../../src/schema/responses/login';
import { authCredentialsOrSkip, makeLoginPayload } from '../helpers/auth';

test.describe('POST /login – Token Validation', () => {
  test('accessToken has valid JWT 3-part structure', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login(makeLoginPayload(settings, credentials));
    expect(response.status()).toBe(200);

    const parsed = LoginSuccessSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

    if (parsed.success) {
      const parts = parsed.data.token.split('.');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^eyJ/);
    }
  });

  test('JWT payload contains required claims (sub, exp, iat)', async ({ apiClient, settings }) => {
    const credentials = authCredentialsOrSkip(settings);
    const response = await apiClient.auth.login(makeLoginPayload(settings, credentials));
    expect(response.status()).toBe(200);

    const parsed = LoginSuccessSchema.safeParse(await response.json());
    expect(parsed.success, `Invalid response schema: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);

    if (parsed.success) {
      const payloadBase64 = parsed.data.token.split('.')[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8')) as Record<string, unknown>;

      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('exp');
      expect(payload).toHaveProperty('iat');
      expect(typeof payload['exp']).toBe('number');
      expect(typeof payload['iat']).toBe('number');
    }
  });
});
