import { expect, Locator, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export class CollectionsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get createButton(): Locator {
    return this.page.locator(UiLocators.collections.createButton).first();
  }

  private get nameInput(): Locator {
    return this.page.locator(UiLocators.collections.nameInput).first();
  }

  private get submitCreateButton(): Locator {
    return this.page.locator(UiLocators.collections.submitCreateButton).first();
  }

  private get searchInput(): Locator {
    return this.page.locator(UiLocators.collections.searchInput).first();
  }

  private get deleteButton(): Locator {
    return this.page.locator(UiLocators.collections.deleteButton).first();
  }

  private get confirmDeleteButton(): Locator {
    return this.page.locator(UiLocators.collections.confirmDeleteButton).first();
  }

  async createCollection(name: string): Promise<void> {
    await this.createButton.click();
    await this.nameInput.fill(name);
    await this.submitCreateButton.click();
    await this.waitForSettle();
  }

  async searchCollections(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async filterByCurrentDay(): Promise<void> {
    const day = new Date().getDate().toString();
    await this.page.locator(UiLocators.common.dateDropdown).first().click();
    await this.page.locator(UiLocators.common.availableDayButton).filter({ hasText: day }).first().click();
    await this.page.locator(UiLocators.common.applyDateButton).first().click();
    await this.waitForSettle();
  }

  async deleteCollection(name: string): Promise<void> {
    const card = this.page.locator(UiLocators.collections.card).filter({ hasText: name }).first();
    await card.locator('svg').first().click();
    await this.deleteButton.click();
    await this.confirmDeleteButton.click();
    await this.waitForSettle();
  }

  async expectCollectionCardVisible(name: string): Promise<void> {
    const card = this.page.locator(UiLocators.collections.cardName).filter({ hasText: name }).first();
    await expect(card).toBeVisible();
  }

  async expectDeleteSuccessToast(): Promise<void> {
    await this.expectToast(/collection deleted successfully/i);
  }
}
