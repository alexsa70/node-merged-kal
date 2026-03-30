import { test, expect } from '../fixtures';
import { HomePage } from '../pages/homePage';

test.describe('E2E home smoke', () => {
  test('open base url', async ({ page, settings }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const homePage = new HomePage(page);
    await homePage.open(String(settings.e2e.baseUrl));

    expect(page.url().startsWith(String(settings.e2e.baseUrl))).toBeTruthy();
  });

  test('homepage has title', async ({ page, settings }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const homePage = new HomePage(page);
    await homePage.open(String(settings.e2e.baseUrl));

    const title = await homePage.title();
    expect(typeof title).toBe('string');
  });
});
