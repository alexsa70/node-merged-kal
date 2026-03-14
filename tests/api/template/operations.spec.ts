import { test, expect } from '../fixtures';

function createResourceSchemaDefaults(): { name: string; description: string } {
  return {
    name: 'resource-name',
    description: 'resource-description',
  };
}

test.describe('Template API tests', () => {
  test('local schema check', async () => {
    const payload = createResourceSchemaDefaults();
    expect(typeof payload.name).toBe('string');
    expect(typeof payload.description).toBe('string');
  });

  test.skip('template: list resources', async ({ apiClient }) => {
    const response = await apiClient.get('/resources');
    expect(response.status()).toBe(200);
  });
});
