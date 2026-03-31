import { test, expect } from '../fixtures';
import { AssistPage } from '../pages/assistPage';
import { SidebarPage } from '../pages/sidebarPage';

test.describe('E2E assist upload', () => {
  test('upload button opens file chooser dialog', async ({ authedPage: page }) => {
    const sidebarPage = new SidebarPage(page);
    const assistPage = new AssistPage(page);

    await sidebarPage.navigateToAssist();
    await assistPage.expectWelcomeTitleVisible();

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      assistPage.clickUploadButton(),
    ]);

    expect(fileChooser).toBeTruthy();
  });
});
