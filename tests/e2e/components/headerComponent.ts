import { Page } from '@playwright/test';

export class HeaderComponent {
  constructor(private readonly page: Page) {}

  async isVisible(): Promise<boolean> {
    return this.page.locator('header').first().isVisible();
  }
}
