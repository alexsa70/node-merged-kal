import { test, expect } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { HomePage } from '../pages/homePage';

const settings = getSettings();

test.describe('E2E home smoke', () => {
  test('open base url', async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const homePage = new HomePage(page);
    await homePage.open(String(settings.e2e.baseUrl));

    expect(page.url().startsWith(String(settings.e2e.baseUrl))).toBeTruthy();
  });

  test('homepage has title', async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const homePage = new HomePage(page);
    await homePage.open(String(settings.e2e.baseUrl));

    const title = await homePage.title();
    expect(typeof title).toBe('string');
  });
});
