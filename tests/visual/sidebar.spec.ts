import { test } from './fixtures';
import { expectElementScreenshot, stabilizePage } from '../../src/tools/visual';
import { SidebarPage } from '../e2e/pages/sidebarPage';

/**
 * Visual tests for the Sidebar navigation.
 * Mirrors Python: TestSidebarNavigationVisual
 */
test.describe('Sidebar visual', () => {

  test.beforeEach(async ({ settings }) => {
    if (!settings.e2e.baseUrl)     test.skip(true, 'E2E_BASE_URL not configured');
    if (!settings.authCredentials) test.skip(true, 'AUTH_CREDENTIALS not configured');
  });

  test('sidebar - regular user @smoke', async ({ authedPage: page }) => {
    const sidebar = new SidebarPage(page);
    await sidebar.container.waitFor({ state: 'visible', timeout: 15_000 });
    await stabilizePage(page);

    await expectElementScreenshot(sidebar.container, 'sidebar-regular-user.png', {
      mask: [sidebar.userSection],
    });
  });

  test('sidebar - collapsed state', async ({ authedPage: page }) => {
    const sidebar = new SidebarPage(page);
    await sidebar.container.waitFor({ state: 'visible', timeout: 15_000 });

    await sidebar.ensureCollapsed();
    await page.waitForTimeout(400); // wait for collapse animation

    await expectElementScreenshot(sidebar.container, 'sidebar-collapsed.png');
  });
});
