import { expect, Locator, Page } from '@playwright/test';
import { UiEndpoints, UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export class UserSettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(baseUrl: string): Promise<void> {
    await this.goto(baseUrl + UiEndpoints.settings);
  }

  get profileSection(): Locator {
    return this.page.locator(UiLocators.settings.profileSection).first();
  }

  get userInfo(): Locator {
    return this.page.locator(UiLocators.settings.userInfo).first();
  }

  private get usernameText(): Locator {
    return this.userInfo.locator('p').first();
  }

  async getUsername(): Promise<string> {
    await expect(this.userInfo).toBeVisible({ timeout: 10_000 });
    return this.usernameText.innerText();
  }
}
