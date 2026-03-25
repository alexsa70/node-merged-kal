import { test } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { UiEndpoints } from '../constants/ui';
import { LoginPage } from '../pages/loginPage';
import { SidebarPage } from '../pages/sidebarPage';

const settings = getSettings();

test.describe('E2E sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');
    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
  });

  test('sidebar navigation for regular user', async ({ page }) => {
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const loginPage = new LoginPage(page);
    const sidebarPage = new SidebarPage(page);

    await loginPage.loginAsRegularUser();
    await loginPage.expectLoginSuccess();

    await sidebarPage.navigateToAssist();
    await sidebarPage.expectCurrentPath(UiEndpoints.assist);

    await sidebarPage.openHistoryFullPage();
    await sidebarPage.expectCurrentPath(UiEndpoints.history);

    await sidebarPage.navigateToCollections();
    await sidebarPage.expectCurrentPath(UiEndpoints.collections);

    await sidebarPage.navigateToDocuments();
    await sidebarPage.expectCurrentPath(UiEndpoints.documents);

    await sidebarPage.navigateToAudio();
    await sidebarPage.expectCurrentPath(UiEndpoints.audio);

    await sidebarPage.openMediaGallery();
    await sidebarPage.expectCurrentPath(UiEndpoints.mediaGallery);

    await sidebarPage.openMediaAlbums();
    await sidebarPage.expectCurrentPath(UiEndpoints.mediaAlbums);
  });

  test('admin section is hidden for regular user', async ({ page }) => {
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    test.skip(!creds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');

    const loginPage = new LoginPage(page);
    const sidebarPage = new SidebarPage(page);

    await loginPage.loginAsRegularUser();
    await loginPage.expectLoginSuccess();
    await sidebarPage.expectAdminSectionVisible(false);
  });

  test('admin submenu navigation for admin user', async ({ page }) => {
    test.skip(!settings.authCredentialsAdmin, 'AUTH_CREDENTIALS_ADMIN.* is not configured');

    const loginPage = new LoginPage(page);
    const sidebarPage = new SidebarPage(page);

    await loginPage.loginAsAdminUser();
    await loginPage.expectLoginSuccess();

    await sidebarPage.openConnectors();
    await sidebarPage.expectCurrentPath(UiEndpoints.connectors);

    await sidebarPage.openAutomations();
    await sidebarPage.expectCurrentPath(UiEndpoints.automations);

    await sidebarPage.openOrganization();
    await sidebarPage.expectCurrentPath(UiEndpoints.organization);
  });

  test.describe('sidebar toggle', () => {
    const roles = [
      { name: 'regular', useAdminCreds: false },
      { name: 'admin', useAdminCreds: true },
    ];

    for (const role of roles) {
      test(`collapse and expand (${role.name})`, async ({ page }) => {
        if (role.useAdminCreds) {
          test.skip(!settings.authCredentialsAdmin, 'AUTH_CREDENTIALS_ADMIN.* is not configured');
        } else {
          const regularCreds = settings.authCredentialsUser ?? settings.authCredentials;
          test.skip(!regularCreds, 'AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* is not configured');
        }

        const loginPage = new LoginPage(page);
        const sidebarPage = new SidebarPage(page);

        if (role.useAdminCreds) {
          await loginPage.loginAsAdminUser();
        } else {
          await loginPage.loginAsRegularUser();
        }

        await loginPage.expectLoginSuccess();
        await sidebarPage.ensureCollapsed();
        await sidebarPage.toggleSidebar();
        await sidebarPage.expectExpanded();
        await sidebarPage.toggleSidebar();
        await sidebarPage.expectCollapsed();
      });
    }
  });
});
