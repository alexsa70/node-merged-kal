import { expect, Locator, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export type FilesPageType = 'doc' | 'audio' | 'media' | 'tables';

export class FilesPage extends BasePage {
  private readonly type: FilesPageType;

  constructor(page: Page, type: FilesPageType) {
    super(page);
    this.type = type;
  }

  private bar(suffix: string): string {
    return `[data-testid="files-page-${this.type}-bar-${suffix}"]`;
  }

  private map(suffix: string): string {
    return `[data-testid="files-page-${this.type}-map-${suffix}"]`;
  }

  get filesCountLocator(): Locator {
    return this.page.locator(this.bar('files-count')).first();
  }

  get tableViewButton(): Locator {
    return this.page.locator(this.bar('table-view-button')).first();
  }

  get filterDropdownButton(): Locator {
    return this.page.getByRole('button', { name: 'Open filters' });
  }

  async getFilesCount(): Promise<number> {
    const raw = await this.filesCountLocator.innerText();
    const match = raw.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  async waitForFilesCountAtLeast(expected: number, timeoutMs = 45_000): Promise<number> {
    const startedAt = Date.now();
    let last = 0;

    while (Date.now() - startedAt < timeoutMs) {
      await this.waitForSettle();
      last = await this.getFilesCount();
      if (last >= expected) {
        return last;
      }
      await this.page.waitForTimeout(1_500);
    }

    throw new Error(`Files count did not reach ${expected}; last observed=${last}`);
  }

  async selectConnector(connectorName: string): Promise<void> {
    await this.filterDropdownButton.click();
    await this.page.locator(this.bar('filter-dropdown-item-connectors')).first().click();

    const item = this.page
      .locator(this.bar(`connectors-panel-connector-filter-item-${connectorName.toLowerCase()}`))
      .first();
    await item.click();

    await this.page.locator(this.bar('connectors-panel-connector-filter-apply-button')).first().click();
    await this.waitForSettle();
  }

  async switchToTableView(): Promise<void> {
    await this.tableViewButton.click();
    await expect(this.page.locator(this.map('name-column-header')).first()).toBeVisible();
  }

  async getFirstFileName(): Promise<string> {
    const cell = this.page.locator(this.map('name-cell-0')).first();
    await expect(cell).toBeVisible();
    return cell.innerText();
  }

  async filterByCurrentDay(): Promise<void> {
    const day = new Date().getDate().toString();
    await this.filterDropdownButton.click();
    await this.page.locator(this.bar('filter-dropdown-item-date')).first().click();
    await this.page.locator(UiLocators.common.availableDayButton).filter({ hasText: day }).first().click();
    await this.waitForSettle();
  }
}
