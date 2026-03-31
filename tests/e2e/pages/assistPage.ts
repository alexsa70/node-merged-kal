import { expect, Locator, Page } from '@playwright/test';
import { UiEndpoints, UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export class AssistPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get welcomeTitle(): Locator {
    return this.page.locator(UiLocators.assist.welcomeTitle).first();
  }

  get chatInput(): Locator {
    return this.page.locator('[data-testid="chat-input"]').first();
  }

  get userAvatar(): Locator {
    return this.page.locator('[data-testid="user-avatar"]');
  }

  get timestamp(): Locator {
    return this.page.locator('time, [data-testid="timestamp"]');
  }

  private get chatTextarea(): Locator {
    return this.page.locator(UiLocators.chat.textarea).first();
  }

  private get processingLoader(): Locator {
    return this.page.locator(UiLocators.chat.processingLoader).first();
  }

  private get conversations(): Locator {
    return this.page.locator(UiLocators.chat.conversations).first();
  }

  private get firstResponseParagraph(): Locator {
    return this.conversations.locator('p')
      .first();
  }

  async expectWelcomeTitleVisible(): Promise<void> {
    await expect(this.welcomeTitle).toBeVisible();
  }

  async expectWelcomeContainsText(text: string): Promise<void> {
    await expect(this.welcomeTitle).toContainText(new RegExp(text, 'i'));
  }

  async sendMessage(query: string): Promise<void> {
    await this.chatTextarea.fill(query);
    await this.page.keyboard.press('Enter');
  }

  async sendMessageAndWaitForResponse(query: string): Promise<void> {
    await expect(this.chatTextarea).toBeVisible();
    await this.sendMessage(query);
    await this.page.waitForURL(new RegExp(`${UiEndpoints.results}(?:[/?#]|$)`), { timeout: 30_000 });
    await this.processingLoader.waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => undefined);
    await expect(this.conversations).toBeVisible({ timeout: 30_000 });
    await expect(this.firstResponseParagraph).toHaveText(/\S+/, { timeout: 30_000 });
  }
}
