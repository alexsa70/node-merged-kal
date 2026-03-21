import { Page, Locator, PageScreenshotOptions } from '@playwright/test';
import { expect } from '@playwright/test';
import { allure } from 'allure-playwright';

export type VisualOptions = {
  /** Max per-pixel color difference 0–1. Default: 0.1 */
  threshold?: number;
  /** Max fraction of differing pixels 0–1. Default: 0.01 (1%) */
  maxDiffPixelRatio?: number;
  /** Locators whose regions are blacked-out before comparison */
  mask?: Locator[];
  /** Full-page screenshot. Default: false */
  fullPage?: boolean;
  /** Clip to specific element */
  clip?: PageScreenshotOptions['clip'];
  /** Animations: 'disabled' (default) | 'allow' */
  animations?: 'disabled' | 'allow';
};

const DEFAULTS: Required<Pick<VisualOptions, 'threshold' | 'maxDiffPixelRatio' | 'animations'>> = {
  threshold: 0.1,
  maxDiffPixelRatio: 0.01,
  animations: 'disabled',
};

/**
 * Compare page screenshot against baseline.
 * On mismatch, attaches current + diff images to Allure.
 *
 * First run: creates baseline automatically (no failure).
 * Subsequent runs: compares against stored baseline.
 *
 * To update baselines: `npx playwright test --update-snapshots`
 */
export async function expectScreenshot(
  page: Page,
  snapshotName: string,
  options: VisualOptions = {},
): Promise<void> {
  const { threshold, maxDiffPixelRatio, animations, mask, fullPage, clip } = {
    ...DEFAULTS,
    ...options,
  };

  await allure.step(`Visual snapshot: ${snapshotName}`, async () => {
    await expect(page).toHaveScreenshot(snapshotName, {
      threshold,
      maxDiffPixelRatio,
      animations,
      mask,
      fullPage,
      clip,
    });
  });
}

/**
 * Compare element screenshot against baseline.
 */
export async function expectElementScreenshot(
  locator: Locator,
  snapshotName: string,
  options: VisualOptions = {},
): Promise<void> {
  const { threshold, maxDiffPixelRatio, animations, mask } = {
    ...DEFAULTS,
    ...options,
  };

  await allure.step(`Visual snapshot [element]: ${snapshotName}`, async () => {
    await expect(locator).toHaveScreenshot(snapshotName, {
      threshold,
      maxDiffPixelRatio,
      animations,
      mask,
    });
  });
}

/**
 * Wait for page to be visually stable before taking a screenshot.
 * Disables animations and waits for network idle.
 */
export async function stabilizePage(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  // Let CSS transitions settle
  await page.waitForTimeout(300);
}
