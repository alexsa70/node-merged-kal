import { expect, Locator, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';
import { BasePage } from './basePage';

export class SidebarPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get container(): Locator {
    return this.page.locator(UiLocators.sidebar.container).first();
  }

  get userSection(): Locator {
    return this.page.locator(UiLocators.sidebar.userSection).first();
  }

  private async click(selector: string): Promise<void> {
    await this.page.locator(selector).first().click();
  }

  async expectAdminSectionVisible(visible: boolean): Promise<void> {
    const adminBtn = this.page.locator(UiLocators.sidebar.adminsBtn).first();
    if (visible) {
      await expect(adminBtn).toBeVisible();
    } else {
      await expect(adminBtn).toHaveCount(0);
    }
  }

  async navigateToAssist(): Promise<void> {
    await this.click(UiLocators.sidebar.assistBtn);
  }

  async navigateToCollections(): Promise<void> {
    await this.click(UiLocators.sidebar.collectionsBtn);
  }

  async navigateToDocuments(): Promise<void> {
    await this.click(UiLocators.sidebar.documentsBtn);
  }

  async navigateToAudio(): Promise<void> {
    await this.click(UiLocators.sidebar.audioBtn);
  }

  async openHistoryPreview(): Promise<void> {
    await this.click(UiLocators.sidebar.historyBtn);
  }

  async navigateToUserSettings(): Promise<void> {
    await this.click(UiLocators.sidebar.userAvatar);
  }

  async openHistoryFullPage(): Promise<void> {
    await this.openHistoryPreview();
    await this.click(UiLocators.sidebar.seeAllHistoryBtn);
  }

  async openMediaGallery(): Promise<void> {
    await this.click(UiLocators.sidebar.mediaBtn);
    await this.click(UiLocators.sidebar.mediaGalleryBtn);
  }

  async openMediaAlbums(): Promise<void> {
    await this.click(UiLocators.sidebar.mediaBtn);
    await this.click(UiLocators.sidebar.mediaAlbumsBtn);
  }

  async openConnectors(): Promise<void> {
    await this.click(UiLocators.sidebar.adminsBtn);
    await this.click(UiLocators.sidebar.connectorsBtn);
  }

  async openAutomations(): Promise<void> {
    await this.click(UiLocators.sidebar.adminsBtn);
    await this.click(UiLocators.sidebar.automationsBtn);
  }

  async openOrganization(): Promise<void> {
    await this.click(UiLocators.sidebar.adminsBtn);
    await this.click(UiLocators.sidebar.organizationBtn);
  }

  async toggleSidebar(): Promise<void> {
    await this.click(UiLocators.sidebar.toggleBtn);
  }

  async expectCollapsed(): Promise<void> {
    await expect(this.container).not.toHaveClass(/\bSideBar_open__\S+\b/);
  }

  async expectExpanded(): Promise<void> {
    await expect(this.container).toHaveClass(/\bSideBar_open__\S+\b/);
  }

  async ensureCollapsed(): Promise<void> {
    const currentClass = (await this.container.getAttribute('class')) ?? '';
    if (currentClass.includes('SideBar_open__')) {
      await this.toggleSidebar();
    }
    await this.expectCollapsed();
  }
}
