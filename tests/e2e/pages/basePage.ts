import { expect, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  }

  async waitForSettle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    const pageLoader = this.page.locator(UiLocators.common.pageLoader).first();
    if (await pageLoader.isVisible().catch(() => false)) {
      await pageLoader.waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => undefined);
    }

    const skeleton = this.page.locator(UiLocators.common.skeletonLoader).first();
    if (await skeleton.isVisible().catch(() => false)) {
      await skeleton.waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => undefined);
    }
  }

  async expectToast(text: string | RegExp): Promise<void> {
    await expect(this.page.locator(UiLocators.toast.title).first()).toHaveText(text);
  }

  async expectCurrentPath(endpoint: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(endpoint)}(?:[/?#]|$)`));
  }
}
