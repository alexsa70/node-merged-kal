import { test, expect } from '../fixtures';
import { AssistPage } from '../pages/assistPage';
import { SidebarPage } from '../pages/sidebarPage';
import { UserSettingsPage } from '../pages/userSettingsPage';

async function getCurrentUsername(settingsPage: UserSettingsPage, baseUrl: string): Promise<string> {
  await settingsPage.open(baseUrl);
  const username = await settingsPage.getUsername();
  expect(username.trim().length).toBeGreaterThan(0);
  return username;
}

test.describe('Username presentation on sidebar.', () => {  

  test(`Verify current user's username is displayed in Sidebar`, async ({ authedPage: page, settings }) => {
    const sidebarPage = new SidebarPage(page);
    const settingsPage = new UserSettingsPage(page);

    const username = await getCurrentUsername(settingsPage, String(settings.e2e.baseUrl));
    await expect(sidebarPage.userSection).toContainText(new RegExp(username, 'i'));
  });

});