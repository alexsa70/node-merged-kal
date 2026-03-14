import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(baseUrl: string): Promise<void> {
    await this.goto(baseUrl);
  }

  async title(): Promise<string> {
    return this.page.title();
  }
}
