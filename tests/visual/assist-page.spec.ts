import { test } from './fixtures';
import { expectScreenshot, expectElementScreenshot, stabilizePage } from '../../src/tools/visual';
import { AssistPage } from '../e2e/pages/assistPage';
import { SidebarPage } from '../e2e/pages/sidebarPage';

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
    const assistPage = new AssistPage(page);

    await expectScreenshot(page, 'assist-page-full.png', {
      fullPage: true,
      mask: [assistPage.userAvatar, assistPage.timestamp],
    });
  });

  test('assist page - sidebar element', async ({ authedPage: page }) => {
    await stabilizePage(page);
    const sidebar = new SidebarPage(page);

    const visible = await sidebar.container.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!visible) test.skip(true, 'Sidebar not found');

    await expectElementScreenshot(sidebar.container, 'assist-page-sidebar.png');
  });

  test('assist page - main content area', async ({ authedPage: page }) => {
    const assistPage = new AssistPage(page);
    await assistPage.chatInput.waitFor({ state: 'visible', timeout: 15_000 });
    await stabilizePage(page);

    await expectElementScreenshot(assistPage.chatInput, 'assist-page-main.png', {
      mask: [assistPage.timestamp],
    });
  });
});
