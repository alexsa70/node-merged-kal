import { test } from '../fixtures';
import { UiEndpoints } from '../constants/ui';
import { LoginPage } from '../pages/loginPage';
import { SidebarPage } from '../pages/sidebarPage';

test.describe('E2E sidebar navigation', () => {
  test('sidebar navigation for regular user', async ({ authedPage: page }) => {
    const sidebarPage = new SidebarPage(page);

    await sidebarPage.navigateToAssist();
    await sidebarPage.expectCurrentPath(UiEndpoints.assist);

    await sidebarPage.openHistoryFullPage();
    await sidebarPage.expectCurrentPath(UiEndpoints.history);

    await sidebarPage.navigateToDocuments();
    await sidebarPage.expectCurrentPath(UiEndpoints.documents);

    await sidebarPage.navigateToAudio();
    await sidebarPage.expectCurrentPath(UiEndpoints.audio);

    await sidebarPage.openMediaGallery();
    await sidebarPage.expectCurrentPath(UiEndpoints.mediaGallery);

    await sidebarPage.openMediaAlbums();
    await sidebarPage.expectCurrentPath(UiEndpoints.mediaAlbums);
  });

  test('admin section is hidden for regular user', async ({ authedPage: page }) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.expectAdminSectionVisible(false);
  });

  test('admin submenu navigation for admin user', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);

    await sidebarPage.openConnectors();
    await sidebarPage.expectCurrentPath(UiEndpoints.connectors);

    await sidebarPage.openOrganization();
    await sidebarPage.expectCurrentPath(UiEndpoints.organization);
  });

  test.describe('sidebar toggle', () => {
    test('collapse and expand (regular)', async ({ authedPage: page }) => {
      const sidebarPage = new SidebarPage(page);
      await sidebarPage.ensureCollapsed();
      await sidebarPage.toggleSidebar();
      await sidebarPage.expectExpanded();
      await sidebarPage.toggleSidebar();
      await sidebarPage.expectCollapsed();
    });

    test('collapse and expand (admin)', async ({ authedPageAdmin: page }) => {
      const sidebarPage = new SidebarPage(page);
      await sidebarPage.ensureCollapsed();
      await sidebarPage.toggleSidebar();
      await sidebarPage.expectExpanded();
      await sidebarPage.toggleSidebar();
      await sidebarPage.expectCollapsed();
    });
  });
});
