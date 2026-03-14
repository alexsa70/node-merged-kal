import { test, expect } from '../fixtures';

test.describe('Authentication /sso_login', () => {
  test('invalid code -> 400 with message', async ({ apiClient }) => {
    const response = await apiClient.ssoLogin({
      orgName: 'acme-corp',
      code: 'invalid_code_xyz',
      redirect_uri: 'https://app.kalsense.com/auth/callback',
      provider: 'google',
    });
    expect(response.status()).toBe(400);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.message).toBeTruthy();
  });

  test('missing orgName -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/sso_login', {
      code: 'some_code',
      redirect_uri: 'https://app.kalsense.com/auth/callback',
      provider: 'google',
    });
    expect([400, 422]).toContain(response.status());
  });

  test('missing code -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/sso_login', {
      orgName: 'acme-corp',
      redirect_uri: 'https://app.kalsense.com/auth/callback',
      provider: 'google',
    });
    expect([400, 422]).toContain(response.status());
  });

  test('missing redirect_uri -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/sso_login', {
      orgName: 'acme-corp',
      code: 'some_code',
      provider: 'google',
    });
    expect([400, 422]).toContain(response.status());
  });

  test('missing provider -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.post('/sso_login', {
      orgName: 'acme-corp',
      code: 'some_code',
      redirect_uri: 'https://app.kalsense.com/auth/callback',
    });
    expect([400, 422]).toContain(response.status());
  });

  test('unknown provider -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.ssoLogin({
      orgName: 'acme-corp',
      code: 'some_code',
      redirect_uri: 'https://app.kalsense.com/auth/callback',
      provider: 'unknown_provider_xyz',
    });
    expect([400, 422]).toContain(response.status());
  });

  test('open redirect rejected -> 400/422', async ({ apiClient }) => {
    const response = await apiClient.ssoLogin({
      orgName: 'acme-corp',
      code: 'some_code',
      redirect_uri: 'https://attacker.com/steal',
      provider: 'google',
    });
    expect([400, 422]).toContain(response.status());
  });

  test('rate limit -> 429 after repeated requests', async ({ apiClient }) => {
    const statusCodes: number[] = [];
    for (let i = 0; i < 55; i += 1) {
      const response = await apiClient.post('/sso_login', {
        orgName: 'acme-corp',
        code: 'some_code',
        redirect_uri: 'https://app.kalsense.com/auth/callback',
        provider: 'google',
      });
      statusCodes.push(response.status());
      if (response.status() === 429) {
        break;
      }
    }
    expect(statusCodes).toContain(429);
  });

  test('SQL injection in orgName -> not 500', async ({ apiClient }) => {
    const response = await apiClient.ssoLogin({
      orgName: "' OR '1'='1",
      code: 'some_code',
      redirect_uri: 'https://app.kalsense.com/auth/callback',
      provider: 'google',
    });
    expect(response.status()).not.toBe(500);
  });

  test('JWT not leaked in error response', async ({ apiClient }) => {
    const response = await apiClient.ssoLogin({
      orgName: 'acme-corp',
      code: 'invalid_code',
      redirect_uri: 'https://app.kalsense.com/auth/callback',
      provider: 'google',
    });
    expect(await response.text()).not.toContain('eyJ');
  });
});
