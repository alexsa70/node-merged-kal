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

test.describe('Username personalization', () => {
  test(`Verify current user's username is displayed in User Settings`, async ({ authedPage: page, settings }) => {
    const settingsPage = new UserSettingsPage(page);

    await getCurrentUsername(settingsPage, String(settings.e2e.baseUrl));
  });

  test(`Verify current user's username is displayed in Sidebar`, async ({ authedPage: page, settings }) => {
    const sidebarPage = new SidebarPage(page);
    const settingsPage = new UserSettingsPage(page);

    const username = await getCurrentUsername(settingsPage, String(settings.e2e.baseUrl));
    await expect(sidebarPage.userSection).toContainText(new RegExp(username, 'i'));
  });

  test(`Verify current user's username is displayed in Assist welcome message`, async ({ authedPage: page, settings }) => {
    const sidebarPage = new SidebarPage(page);
    const settingsPage = new UserSettingsPage(page);
    const assistPage = new AssistPage(page);

    const username = await getCurrentUsername(settingsPage, String(settings.e2e.baseUrl));
    await sidebarPage.navigateToAssist();
    await assistPage.expectWelcomeTitleVisible();
    await assistPage.expectWelcomeContainsText(username);
  });
});
