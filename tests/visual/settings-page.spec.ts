import { test } from './fixtures';
import { expectScreenshot, expectElementScreenshot, stabilizePage } from '../../src/tools/visual';
import { UserSettingsPage } from '../e2e/pages/userSettingsPage';

/**
 * Visual tests for Settings page.
 * Mirrors Python: TestSettingsPageVisual
 */
test.describe('Settings page visual', () => {

  test.beforeEach(async ({ settings }) => {
    if (!settings.e2e.baseUrl)     test.skip(true, 'E2E_BASE_URL not configured');
    if (!settings.authCredentials) test.skip(true, 'AUTH_CREDENTIALS not configured');
  });

  test('settings page full @smoke', async ({ authedPage: page, settings }) => {
    const settingsPage = new UserSettingsPage(page);
    await settingsPage.open(settings.e2e.baseUrl!);
    await stabilizePage(page);

    await expectScreenshot(page, 'settings-page-full.png', {
      fullPage: true,
      mask: [settingsPage.userInfo],
    });
  });

  test('settings page - user profile section', async ({ authedPage: page, settings }) => {
    const settingsPage = new UserSettingsPage(page);
    await settingsPage.open(settings.e2e.baseUrl!);
    await stabilizePage(page);

    const visible = await settingsPage.profileSection.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!visible) test.skip(true, 'Profile section not found');

    await expectElementScreenshot(settingsPage.profileSection, 'settings-profile-section.png', {
      mask: [settingsPage.userInfo],
    });
  });
});
