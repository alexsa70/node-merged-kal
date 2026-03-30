import { test } from '../fixtures';
import { UiEndpoints } from '../constants/ui';
import { AssistPage } from '../pages/assistPage';
import { HistoryPage } from '../pages/historyPage';
import { SidebarPage } from '../pages/sidebarPage';

const regularQuery = 'תן לי רקע כללי';
const adminQuery = 'מה נבדק באמ״ן';

test.describe('E2E history page', () => {
  test.describe.configure({ mode: 'serial' });

  test('validate history exists as regular user', async ({ authedPage: page }) => {
    const sidebarPage = new SidebarPage(page);
    const assistPage = new AssistPage(page);
    const historyPage = new HistoryPage(page);

    await sidebarPage.navigateToAssist();
    await assistPage.sendMessageAndWaitForResponse(regularQuery);

    await sidebarPage.openHistoryFullPage();
    await sidebarPage.expectCurrentPath(UiEndpoints.historyFull);

    await historyPage.searchConversations(regularQuery);
    await historyPage.expectConversationCardVisible();
  });

  test('validate history exists as admin user', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);
    const assistPage = new AssistPage(page);
    const historyPage = new HistoryPage(page);

    await sidebarPage.navigateToAssist();
    await assistPage.sendMessageAndWaitForResponse(adminQuery);

    await sidebarPage.openHistoryFullPage();
    await sidebarPage.expectCurrentPath(UiEndpoints.historyFull);

    await historyPage.searchConversations(adminQuery);
    await historyPage.expectConversationCardVisible();
  });
});
