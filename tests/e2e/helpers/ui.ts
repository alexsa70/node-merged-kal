import { expect, Page } from '@playwright/test';
import { UiLocators } from '../constants/ui';

export async function waitForUiToSettle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');

  const pageLoader = page.locator(UiLocators.common.pageLoader).first();
  if (await pageLoader.isVisible().catch(() => false)) {
    await pageLoader.waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => undefined);
  }

  const skeleton = page.locator(UiLocators.common.skeletonLoader).first();
  if (await skeleton.isVisible().catch(() => false)) {
    await skeleton.waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => undefined);
  }
}

export async function navigateToUserSettings(page: Page): Promise<void> {
  await page.locator(UiLocators.sidebar.userAvatar).first().click();
  await page.locator(UiLocators.sidebar.settingsButton).first().click();
  await waitForUiToSettle(page);
}

export async function selectConnector(page: Page, connectorName: string): Promise<void> {
  await page.locator(UiLocators.filesBar.connectorsDropdown).first().click();
  const item = page
    .locator(UiLocators.filesBar.connectorsItems)
    .locator(`[title="${connectorName}"]`)
    .first();
  await item.scrollIntoViewIfNeeded();
  await item.click();
  await page.locator(UiLocators.filesBar.connectorsApply).first().click();
  await waitForUiToSettle(page);
}

export async function filesCount(page: Page): Promise<number> {
  const raw = await page.locator(UiLocators.filesBar.filesCount).first().innerText();
  const match = raw.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export async function waitForFilesCountAtLeast(page: Page, expected: number, timeoutMs = 45_000): Promise<number> {
  const startedAt = Date.now();
  let last = 0;

  while (Date.now() - startedAt < timeoutMs) {
    await waitForUiToSettle(page);
    last = await filesCount(page);
    if (last >= expected) {
      return last;
    }
    await page.waitForTimeout(1_500);
  }

  throw new Error(`Files count did not reach ${expected}; last observed=${last}`);
}

export async function filterByCurrentDay(page: Page): Promise<void> {
  const day = new Date().getDate().toString();
  await page.locator(UiLocators.common.dateDropdown).first().click();
  await page.locator(UiLocators.common.availableDayButton).filter({ hasText: day }).first().click();
  await page.locator(UiLocators.common.applyDateButton).first().click();
  await waitForUiToSettle(page);
}

export async function switchToTableView(page: Page): Promise<void> {
  await page.locator(UiLocators.filesBar.tableViewBtn).first().click();
  await expect(page.locator(UiLocators.filesView.listHeader).first()).toBeVisible();
}

export async function firstFileNameInTable(page: Page): Promise<string> {
  const firstName = page.locator(UiLocators.filesView.fileNameTable).first();
  await expect(firstName).toBeVisible();
  return firstName.innerText();
}
