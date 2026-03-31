import { test } from '../fixtures';
import { UiEndpoints } from '../constants/ui';
import { HistoryPage } from '../pages/historyPage';
import { SidebarPage } from '../pages/sidebarPage';

test.describe('E2E history page', () => {
  test('Verify History preview displays existing conversations for regular user', async ({ authedPage: page }) => {
    const sidebarPage = new SidebarPage(page);
    const historyPage = new HistoryPage(page);

    await sidebarPage.openHistoryPreview();
    await historyPage.expectPreviewConversationVisible();
    await historyPage.expectSeeMoreVisible();
  });

  test('Verify admin user can open full History page and search existing conversations', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);
    const historyPage = new HistoryPage(page);

    await sidebarPage.openHistoryPreview();
    await historyPage.expectPreviewConversationVisible();

    const conversationText = await historyPage.getFirstConversationText();
    await historyPage.openFullPageFromPreview();
    await sidebarPage.expectCurrentPath(UiEndpoints.historyFull);
    await historyPage.expectFullPageVisible();

    await historyPage.searchConversations(conversationText);
    await historyPage.expectConversationCardVisible(conversationText);
  });
});
