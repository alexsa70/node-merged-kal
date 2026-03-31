import { expect, Locator, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export class AlbumsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private get header(): Locator {
    return this.page.getByTestId('albums-page-header').first();
  }

  private get createAlbumButton(): Locator {
    return this.page.getByTestId('albums-page-album-new').first();
  }

  private get modal(): Locator {
    return this.page.locator(UiLocators.common.globalModal).first();
  }

  private get tagInput(): Locator {
    return this.page.getByPlaceholder('Type Tag').first();
  }

  private get saveButton(): Locator {
    return this.page.getByRole('button', { name: /^save$/i }).first();
  }

  private albumCard(name: string): Locator {
    return this.page.locator('[data-testid^="albums-page-album-"]').filter({ hasText: name });
  }

  private get albumPageTitle(): Locator {
    return this.page.getByTestId('files-page-media-title').first();
  }

  private get actionsDropdown(): Locator {
    return this.page.getByTestId('files-page-media-more-actions-button');
  }

  private get confirmButton(): Locator {
    return this.page.getByTestId('confirm-button');
  }



  async expectPageVisible(): Promise<void> {
    await expect(this.header).toBeVisible();
  }

  async createAlbum(name: string): Promise<void> {
    await this.createAlbumButton.click();
    await expect(this.modal).toBeVisible();
    await this.tagInput.fill(name);
    await this.page.keyboard.press('Enter');
    await this.saveButton.click();
    await expect(this.modal).toBeHidden();
  }

  async openAlbum(name: string): Promise<void> {
    await this.albumCard(name).click();
    await expect(this.albumPageTitle).toBeVisible({ timeout: 10_000 });
  }

  async deleteAlbum(): Promise<void> {
    await this.actionsDropdown.click();
    await this.page.getByText('Delete', { exact: true }).click();
    await expect(this.confirmButton).toBeVisible();
    await this.confirmButton.click();
  }

  async expectAlbumVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }
  async expectAlbumNotVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeHidden();
  }
}
