import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/loginPage';

test.describe('Login page elements', () => {
  test('all login form elements are visible', async ({ page, settings }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));

    await loginPage.expectPageElementsVisible();
  });

  test('submit button is always enabled regardless of field state', async ({ page, settings }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));

    // Empty fields
    await loginPage.expectSubmitButtonEnabled();

    // Only username filled
    await loginPage.fillForm('TestUser', '');
    await loginPage.expectSubmitButtonEnabled();

    // Both fields filled
    await loginPage.fillForm('TestUser', 'TestPassword');
    await loginPage.expectSubmitButtonEnabled();
  });

  test('fields can be cleared after input', async ({ page, settings }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));

    await loginPage.fillForm('TestUser', 'TestPassword');
    await loginPage.clearFields();

    expect(await loginPage.getUsernameValue()).toBe('');
    expect(await loginPage.getPasswordValue()).toBe('');
  });
});
