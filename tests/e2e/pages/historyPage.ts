import { expect, Locator, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export class HistoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get searchInput(): Locator {
    return this.page.locator('[data-testid="history-page-list-search-input"]').first();
  }

  private get conversationCards(): Locator {
    return this.page.locator(UiLocators.history.conversationCard);
  }

  async searchConversations(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForSettle();
  }

  async expectConversationCardVisible(): Promise<void> {
    await expect(this.conversationCards.first()).toBeVisible();
  }

  async filterByCurrentDay(): Promise<void> {
    const day = new Date().getDate().toString();
    await this.page.locator('[data-testid="history-page-list-date-filter-trigger-button"]').first().click();
    await this.page.locator(`[data-testid="history-page-list-date-filter-day-${day}"]`).first().click();
    await this.page.locator('[data-testid="history-page-list-date-filter-apply-button"]').first().click();
    await this.waitForSettle();
  }
}
