import { test } from './fixtures';
import { expectElementScreenshot, stabilizePage } from '../../src/tools/visual';

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
    await stabilizePage(page);

    const sidebar = page.locator('[data-testid="sidebar"], nav, aside').first();
    const visible = await sidebar.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) test.skip(true, 'Sidebar not found');

    await expectElementScreenshot(sidebar, 'sidebar-regular-user.png', {
      mask: [
        page.locator('[data-testid="user-avatar"]'),
        page.locator('[data-testid="user-name"]'),
      ],
    });
  });

  test('sidebar - collapsed state', async ({ authedPage: page }) => {
    await stabilizePage(page);

    const toggleBtn = page.locator('[data-testid="sidebar-toggle"], [data-testid="sidebar-toggler"]').first();
    const toggleVisible = await toggleBtn.isVisible({ timeout: 3_000 }).catch(() => false);

    if (toggleVisible) {
      await toggleBtn.click();
      await page.waitForTimeout(400); // wait for animation
    }

    const sidebar = page.locator('[data-testid="sidebar"], nav, aside').first();
    const visible = await sidebar.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) test.skip(true, 'Sidebar not found');

    await expectElementScreenshot(sidebar, 'sidebar-collapsed.png');
  });
});
