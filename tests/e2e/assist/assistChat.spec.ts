import { test, expect } from '../fixtures';
import { AssistPage } from '../pages/assistPage';
import { SidebarPage } from '../pages/sidebarPage';

test.describe('E2E assist chat', () => {
  test('send question and verify answer appears', async ({ authedPage: page }) => {
    const sidebarPage = new SidebarPage(page);
    const assistPage = new AssistPage(page);

    await sidebarPage.navigateToAssist();
    await assistPage.expectWelcomeTitleVisible();

    await assistPage.sendMessageAndWaitForResponse('Hello! What can you do?');

    await expect(assistPage.conversations).toBeVisible();
  });
});
