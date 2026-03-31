import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/loginPage';

test.describe('E2E home smoke', () => {
  test('base url opens login page', async ({ page, settings }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));

    expect(page.url().startsWith(String(settings.e2e.baseUrl))).toBeTruthy();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });

  test('login page has visible form and non-empty title', async ({ page, settings }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);
  });
});
