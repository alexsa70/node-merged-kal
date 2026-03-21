import { test, expect } from './fixtures';
import { expectScreenshot, expectElementScreenshot, stabilizePage } from '../../src/tools/visual';

/**
 * Visual tests for the Assist page (post-login).
 *
 * Mirrors Python: TestAssistPageVisual
 */
test.describe('Assist page visual', () => {
  test.use({ testIdAttribute: 'data-testid' });

  test.beforeEach(async ({ settings }) => {
    if (!settings.e2e.baseUrl) test.skip(true, 'E2E_BASE_URL not configured');
    if (!settings.authCredentials)  test.skip(true, 'AUTH_CREDENTIALS not configured');
  });

  test('assist page full @smoke', async ({ authedPage: page }) => {
    await stabilizePage(page);

    // Mask dynamic elements: timestamps, user avatar, any counters
    const dynamicLocators = [
      page.locator('[data-testid="user-avatar"]'),
      page.locator('[data-testid="timestamp"]'),
      page.locator('time'),
    ];

    await expectScreenshot(page, 'assist-page-full.png', {
      fullPage: true,
      mask: dynamicLocators,
    });
  });

  test('assist page - sidebar element', async ({ authedPage: page }) => {
    await stabilizePage(page);

    const sidebar = page.locator('[data-testid="sidebar"], nav, aside').first();
    const sidebarVisible = await sidebar.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!sidebarVisible) test.skip(true, 'Sidebar not found');

    await expectElementScreenshot(sidebar, 'assist-page-sidebar.png');
  });

  test('assist page - main content area', async ({ authedPage: page }) => {
    await stabilizePage(page);

    const main = page.locator('main, [role="main"], [data-testid="main-content"]').first();
    const mainVisible = await main.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!mainVisible) test.skip(true, 'Main content area not found');

    await expectElementScreenshot(main, 'assist-page-main.png', {
      mask: [page.locator('time'), page.locator('[data-testid="timestamp"]')],
    });
  });
});
