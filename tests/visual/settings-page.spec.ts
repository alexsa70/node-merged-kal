import { test } from './fixtures';
import { expectScreenshot, expectElementScreenshot, stabilizePage } from '../../src/tools/visual';

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
    const settingsPath = '/user/settings';
    await page.goto(settings.e2e.baseUrl + settingsPath);
    await stabilizePage(page);

    await expectScreenshot(page, 'settings-page-full.png', {
      fullPage: true,
      // Mask user-specific data like email, avatar, join date
      mask: [
        page.locator('[data-testid="user-email"]'),
        page.locator('[data-testid="user-avatar"]'),
        page.locator('[data-testid="join-date"]'),
        page.locator('time'),
      ],
    });
  });

  test('settings page - user profile section', async ({ authedPage: page, settings }) => {
    await page.goto(settings.e2e.baseUrl + '/user/settings');
    await stabilizePage(page);

    const profileSection = page.locator('[data-testid="profile-section"], [data-testid="user-settings"]').first();
    const visible = await profileSection.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) test.skip(true, 'Profile section not found');

    await expectElementScreenshot(profileSection, 'settings-profile-section.png', {
      mask: [
        page.locator('[data-testid="user-email"]'),
        page.locator('[data-testid="user-avatar"]'),
      ],
    });
  });
});
