import { test, expect } from '../fixtures';
import { UserSettingsPage } from '../pages/userSettingsPage';

test.describe('E2E settings page', () => {
  test('validate settings page shows username', async ({ authedPage: page, settings }) => {
    const settingsPage = new UserSettingsPage(page);
    await settingsPage.open(String(settings.e2e.baseUrl));

    const username = await settingsPage.getUsername();
    expect(username.trim().length).toBeGreaterThan(0);
  });
});
