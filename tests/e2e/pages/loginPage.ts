import { expect, Locator, Page } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { UiEndpoints, UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

type Credentials = {
  identity: string;
  password: string;
};

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get usernameInput(): Locator {
    return this.page.locator(UiLocators.login.usernameInput).first();
  }

  get passwordInput(): Locator {
    return this.page.locator(UiLocators.login.passwordInput).first();
  }

  private get errorMessage(): Locator {
    return this.page.locator(UiLocators.login.errorMessage).first();
  }

  private get submitButton(): Locator {
    return this.page.locator(UiLocators.login.submitButton).first();
  }

  private get logo(): Locator {
    return this.page.getByTestId('new-login-page-logo').first();
  }

  private get welcomeTitle(): Locator {
    return this.page.getByText('Welcome to Sense').first();
  }

  private get subtitle(): Locator {
    return this.page.getByText('The perfect connection').first();
  }

  async open(baseUrl: string): Promise<void> {
    await this.goto(baseUrl);
    await this.page.waitForLoadState('networkidle');
    await expect(this.usernameInput).toBeVisible({ timeout: 15_000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 15_000 });
  }

  async fillForm(identity: string, password: string): Promise<void> {
    await this.usernameInput.fill(identity);
    await this.passwordInput.fill(password);
  }

  async login(identity: string, password: string): Promise<void> {
    await this.fillForm(identity, password);
    await this.submitButton.click();
  }

  async loginAsRegularUser(): Promise<void> {
    const settings = getSettings();
    const creds = settings.authCredentialsUser ?? settings.authCredentials;
    if (!creds) {
      throw new Error('AUTH_CREDENTIALS_USER.* or AUTH_CREDENTIALS.* must be configured');
    }
    await this.login(creds.identity, creds.password);
  }

  async loginAsAdminUser(): Promise<void> {
    const settings = getSettings();
    const creds = settings.authCredentialsAdmin;
    if (!creds) {
      throw new Error('AUTH_CREDENTIALS_ADMIN.* must be configured');
    }
    await this.login(creds.identity, creds.password);
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.usernameInput).toBeHidden({ timeout: 30_000 });
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageElementsVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.welcomeTitle).toBeVisible();
    await expect(this.subtitle).toBeVisible();
  }

  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async getUsernameValue(): Promise<string> {
    return this.usernameInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return this.passwordInput.inputValue();
  }

  async clearFields(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  async expectLoginFailedError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(/invalid login details/i);
    await expect(this.errorMessage).toContainText(/don't match our records/i);
  }

  static invalidUsernameVariant(creds: Credentials): Credentials {
    return { ...creds, identity: `invalid_${creds.identity}` };
  }

  static invalidPasswordVariant(creds: Credentials): Credentials {
    return { ...creds, password: `invalid_${creds.password}` };
  }
}
