import { expect, Locator, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export class HistoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get previewConversationCards(): Locator {
    return this.page.locator(UiLocators.history.previewConversationCard);
  }

  private get seeMoreButton(): Locator {
    return this.page.locator(UiLocators.sidebar.seeAllHistoryBtn).first();
  }

  private get fullPageTitle(): Locator {
    return this.page.locator('[data-testid="history-page-title"]').first();
  }

  private get searchInput(): Locator {
    return this.page.getByPlaceholder(/search previous chats/i).first();
  }

  async searchConversations(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForSettle();
  }

  async expectPreviewConversationVisible(): Promise<void> {
    await expect(this.previewConversationCards.first()).toBeVisible();
  }

  async expectSeeMoreVisible(): Promise<void> {
    await expect(this.seeMoreButton).toBeVisible();
  }

  async openFullPageFromPreview(): Promise<void> {
    await expect(this.seeMoreButton).toBeVisible();
    await this.seeMoreButton.click();
  }

  async expectFullPageVisible(): Promise<void> {
    await expect(this.fullPageTitle).toHaveText(/chat history/i);
  }

  async getFirstConversationText(): Promise<string> {
    await expect(this.previewConversationCards.first()).toBeVisible();
    return (await this.previewConversationCards.first().innerText()).trim();
  }

  async expectConversationCardVisible(query?: string): Promise<void> {
    if (query) {
      await expect(this.page.getByText(query, { exact: true }).first()).toBeVisible();
      return;
    }

    await expect(this.previewConversationCards.first()).toBeVisible();
  }

  async filterByCurrentDay(): Promise<void> {
    const day = new Date().getDate().toString();
    await this.page.locator('[data-testid="history-page-list-date-filter-trigger-button"]').first().click();
    await this.page.locator(`[data-testid="history-page-list-date-filter-day-${day}"]`).first().click();
    await this.page.locator('[data-testid="history-page-list-date-filter-apply-button"]').first().click();
    await this.waitForSettle();
  }
}
