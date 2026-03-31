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

test.describe('Username presentation on Assist page', () => {
  
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
