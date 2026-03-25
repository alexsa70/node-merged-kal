import { Page, test } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { UiEndpoints } from '../constants/ui';
import { AssistPage } from '../pages/assistPage';
import { HistoryPage } from '../pages/historyPage';
import { LoginPage } from '../pages/loginPage';
import { SidebarPage } from '../pages/sidebarPage';

const settings = getSettings();
const regularQuery = 'תן לי רקע כללי';
const adminQuery = 'מה נבדק באמ״ן';

test.describe('E2E history page', () => {
  test.describe.configure({ mode: 'serial' });

  async function loginByRole(page: Page, role: 'regular' | 'admin') {
    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
    if (role === 'admin') {
      await loginPage.loginAsAdminUser();
    } else {
      await loginPage.loginAsRegularUser();
    }
    await loginPage.expectLoginSuccess();
  }

  test('validate history exists as regular user', async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');
    const regularCreds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!regularCreds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    await loginByRole(page, 'regular');
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

  test('validate history exists as admin user', async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');
    test.skip(!settings.authCredentialsAdmin, 'AUTH_CREDENTIALS_ADMIN.* is not configured');

    await loginByRole(page, 'admin');
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
