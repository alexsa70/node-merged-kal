# Test Template 2: Project Structure + How to Add API, UI, and Visual Tests

This document explains how this Playwright + TypeScript project is organized and how to add new `API`, `UI/E2E`, and `Visual` tests in the existing style.

## 1. How the Project Is Built

The project is split into 3 main test layers:

- `tests/api` for backend API checks through Playwright `request`
- `tests/e2e` for browser UI flows
- `tests/visual` for screenshot-based visual regression

Core architecture:

- `playwright.config.ts`
  Defines projects: `api`, `api-e2e`, `e2e`, `visual`
- `global-setup.ts`
  Logs in once for API tests and stores token in `.auth/default-token.json`
- `src/config/settings.ts`
  Reads `.env` values and exposes runtime settings
- `src/clients/`
  API client layer over Playwright request context
- `src/tools/routes/`
  Central place for endpoint paths
- `src/tools/visual.ts`
  Shared helpers for screenshot comparison
- `tests/api/fixtures.ts`
  Shared API fixtures, auth token, role tokens, `apiClient`
- `tests/visual/fixtures.ts`
  Shared visual fixtures, including `authedPage`
- `tests/e2e/pages/`
  Page Object Model for UI tests

## 2. Test Projects

Configured Playwright projects:

- `api`
  Runs all `tests/api/**/*.spec.ts` except `tests/api/e2e`
- `api-e2e`
  Runs API end-to-end flows from `tests/api/e2e/**/*.spec.ts`
- `e2e`
  Runs browser UI tests from `tests/e2e/**/*.spec.ts`
- `visual`
  Runs screenshot regression tests from `tests/visual/**/*.spec.ts`

Important behavior:

- `global-setup.ts` runs only when `api` or `api-e2e` is selected
- `visual` uses fixed viewport, locale, timezone, and Chrome device profile for stable screenshots
- screenshot baselines are stored via `snapshotPathTemplate` under `tests/visual/snapshots/...`

## 3. Configuration and Environment

Settings are read from `.env` through `src/config/settings.ts`.

Main variables used by tests:

- `API_HTTP_CLIENT.URL`
- `API_HTTP_CLIENT.TIMEOUT`
- `AUTH_CREDENTIALS.EMAIL`
- `AUTH_CREDENTIALS.PASSWORD`
- `AUTH_CREDENTIALS.OTP_SECRET`
- `AUTH_CREDENTIALS_SUPER_ADMIN.*`
- `AUTH_CREDENTIALS_ADMIN.*`
- `AUTH_CREDENTIALS_USER.*`
- `ORG_NAME`
- `E2E_BASE_URL`
- `E2E_BROWSER_NAME`
- `E2E_HEADLESS`

Auth model:

- shared default API token is created in `global-setup.ts`
- API tests can read it via `authState` or `authToken`
- role-based API tests can use `tokensByRole`
- visual tests log in through UI using `authedPage`
- plain E2E tests currently use default Playwright `page` and page objects

## 4. API Test Architecture

API tests use these layers:

1. Route constants in `src/tools/routes/*.ts`
2. Resource client in `src/clients/resources/*.ts`
3. Root client aggregation in `src/clients/apiClient.ts`
4. Shared fixtures in `tests/api/fixtures.ts`
5. Spec files in `tests/api/**`

Typical API flow:

- add endpoint path to route file
- add a method to the relevant resource client
- call that method from a spec using `apiClient`
- use `requireAuthToken` or `tokenForRoles` when auth is needed

There are 2 styles already used in the repo:

- direct low-level call:

```ts
const response = await apiClient.post('/api/project/get', payload, undefined, undefined, {
  Authorization: `Bearer ${token}`,
});
```

- preferred project style through resource client:

```ts
const response = await apiClient.project.getProject({ orgId, projectId, token });
```

## 5. How to Add a New API Test

### Step 1. Add route constant

Edit a file in `src/tools/routes/` or create a new one.

Example:

```ts
export const BillingRoutes = {
  GET_INVOICE: '/api/billing/get_invoice',
} as const;
```

If it is a new route file, export it from `src/tools/routes/index.ts`.

### Step 2. Add client method

Add the endpoint to the matching resource client in `src/clients/resources/`.

Example:

```ts
import { APIResponse } from '@playwright/test';
import { BaseClient } from '../baseClient';
import { BillingRoutes } from '../../tools/routes';

export class BillingClient extends BaseClient {
  async getInvoice(params: { invoiceId: string; token: string }): Promise<APIResponse> {
    const { invoiceId, token } = params;
    return this.post(
      BillingRoutes.GET_INVOICE,
      { invoice_id: invoiceId },
      undefined,
      undefined,
      { Authorization: `Bearer ${token}` },
    );
  }
}
```

Then wire it into `src/clients/apiClient.ts`.

### Step 3. Create spec file

Place the new spec in the right folder, for example:

- `tests/api/billing/get-invoice.spec.ts`

Example:

```ts
import { test, expect, requireAuthToken } from '../fixtures';

test.describe('Billing /api/billing/get_invoice', () => {
  test('get invoice -> 200', async ({ apiClient, authState }) => {
    const token = requireAuthToken(authState);

    const response = await apiClient.billing.getInvoice({
      invoiceId: 'invoice-123',
      token,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toBeTruthy();
  });
});
```

### Step 4. Choose auth strategy

- Use `requireAuthToken(authState)` for protected endpoints with shared auth
- Do not use shared token for `/login` tests
- Use `tokenForRoles(tokensByRole, ['admin', 'super_admin'])` for RBAC or role checks

### Step 5. Use good placement

Examples from the repo:

- `tests/api/login/` for auth/login endpoints
- `tests/api/projects/` for CRUD by domain
- `tests/api/general/` for generic service endpoints
- `tests/api/rbac/` for access matrix
- `tests/api/template/operations.spec.ts` as a simple template starting point

### Step 6. Run the test

```bash
npm run test:api
```

Or run only your folder/file:

```bash
npx playwright test tests/api/billing --project=api
npx playwright test tests/api/billing/get-invoice.spec.ts --project=api
```

## 6. API Test Patterns Used in This Repo

Use these conventions when adding new API tests:

- group by domain under `tests/api/<domain>/`
- use `test.describe(...)`
- keep positive and negative scenarios together when practical
- use `test.describe.configure({ mode: 'serial' })` when tests share created entities
- validate both status code and response body
- add cleanup step if test creates data
- use `@smoke` tag for key checks

Good example:

- `tests/api/projects/crud.spec.ts`

It shows:

- serial flow for create/get/update/delete
- use of `tokensByRole`
- positive and negative cases
- cleanup at the end

## 7. UI / E2E Test Architecture

UI tests live in:

- `tests/e2e/specs/`
- `tests/e2e/pages/`

Current style:

- specs stay small
- page actions are wrapped in page objects
- base URL comes from `settings.e2e.baseUrl`

Existing example:

- `tests/e2e/specs/home-smoke.spec.ts`
- `tests/e2e/pages/basePage.ts`
- `tests/e2e/pages/homePage.ts`

## 8. How to Add a New UI / E2E Test

### Step 1. Add or extend a page object

Create or update a class in `tests/e2e/pages/`.

Example:

```ts
import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(baseUrl: string): Promise<void> {
    await this.goto(`${baseUrl}/user/settings`);
  }

  async title(): Promise<string> {
    return this.page.title();
  }
}
```

### Step 2. Create a spec

Create file:

- `tests/e2e/specs/settings.spec.ts`

Example:

```ts
import { test, expect } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { SettingsPage } from '../pages/settingsPage';

const settings = getSettings();

test.describe('Settings UI', () => {
  test('open settings page', async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');

    const settingsPage = new SettingsPage(page);
    await settingsPage.open(String(settings.e2e.baseUrl));

    await expect(page).toHaveURL(/settings/);
  });
});
```

### Step 3. Run E2E tests

```bash
npm run test:e2e
```

Or:

```bash
npx playwright test tests/e2e/specs/settings.spec.ts --project=e2e
```

## 9. Visual Test Architecture

Visual tests use:

- `tests/visual/*.spec.ts`
- `tests/visual/fixtures.ts`
- `src/tools/visual.ts`

Shared helpers:

- `stabilizePage(page)` waits for network idle and UI settling
- `expectScreenshot(page, name, options)` compares full page screenshot
- `expectElementScreenshot(locator, name, options)` compares a single element

Visual project stability settings already exist in `playwright.config.ts`:

- fixed viewport `1920x1080`
- `Desktop Chrome`
- `colorScheme: 'light'`
- `locale: 'en-US'`
- `timezoneId: 'UTC'`
- animation suppression in screenshot assertions

## 10. How to Add a New Visual Test

### Step 1. Create spec file

Example file:

- `tests/visual/profile-page.spec.ts`

Example:

```ts
import { test } from './fixtures';
import { expectScreenshot, expectElementScreenshot, stabilizePage } from '../../src/tools/visual';

test.describe('Profile page visual', () => {
  test.beforeEach(async ({ settings }) => {
    if (!settings.e2e.baseUrl) test.skip(true, 'E2E_BASE_URL not configured');
    if (!settings.authCredentials) test.skip(true, 'AUTH_CREDENTIALS not configured');
  });

  test('profile page full', async ({ authedPage: page, settings }) => {
    await page.goto(settings.e2e.baseUrl + '/user/profile');
    await stabilizePage(page);

    await expectScreenshot(page, 'profile-page-full.png', {
      fullPage: true,
      mask: [
        page.locator('[data-testid="user-email"]'),
        page.locator('[data-testid="user-avatar"]'),
      ],
    });
  });

  test('profile card element', async ({ authedPage: page, settings }) => {
    await page.goto(settings.e2e.baseUrl + '/user/profile');
    await stabilizePage(page);

    const card = page.locator('[data-testid="profile-card"]').first();
    const visible = await card.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!visible) test.skip(true, 'Profile card not found');

    await expectElementScreenshot(card, 'profile-card.png');
  });
});
```

### Step 2. First run creates baseline

On first run, Playwright creates baseline snapshots automatically.

Run:

```bash
npm run test:visual
```

### Step 3. Update snapshots when UI intentionally changes

```bash
npm run test:visual:update
```

## 11. Visual Test Rules for Stable Screenshots

Follow these rules when adding visual coverage:

- always call `stabilizePage(page)` before screenshot
- prefer deterministic routes and states
- mask user-specific or dynamic content
- avoid timestamps, avatars, counters, rotating banners, and random data in assertions
- prefer element screenshots when full page is too noisy
- keep snapshot names explicit and stable

Examples in repo:

- `tests/visual/login.spec.ts`
- `tests/visual/settings-page.spec.ts`
- `tests/visual/sidebar.spec.ts`

## 12. Where to Put New Tests

Use these folders:

- API endpoint/domain tests:
  `tests/api/<domain>/`
- API flow tests:
  `tests/api/e2e/`
- Browser UI tests:
  `tests/e2e/specs/`
- Page objects:
  `tests/e2e/pages/`
- Visual regression:
  `tests/visual/`

## 13. Run Commands

Main commands from `package.json`:

```bash
npm test
npm run test:api
npm run test:e2e
npm run test:visual
npm run test:visual:update
npm run test:smoke
npm run report
npm run typecheck
```

Useful targeted runs:

```bash
npx playwright test tests/api/projects/crud.spec.ts --project=api
npx playwright test tests/e2e/specs/home-smoke.spec.ts --project=e2e
npx playwright test tests/visual/login.spec.ts --project=visual
```

## 14. Suggested Workflow for Adding a Test

For a new API endpoint:

1. Add route
2. Add or update resource client
3. Expose it through `ApiClient` if needed
4. Add spec under `tests/api/<domain>/`
5. Run target spec with `--project=api`

For a new UI test:

1. Create or extend page object
2. Add spec in `tests/e2e/specs/`
3. Use `settings.e2e.baseUrl`
4. Run with `--project=e2e`

For a new visual test:

1. Add spec in `tests/visual/`
2. Use `authedPage` if login is required
3. Stabilize page
4. Add masks for dynamic content
5. Run with `--project=visual`
6. Update baselines only for intentional UI changes

## 15. Debug Checklist

- check `.env` values
- check `API_HTTP_CLIENT.URL` and `E2E_BASE_URL`
- check `.auth/default-token.json` for shared API auth
- confirm required credentials exist for shared or role-based auth
- verify endpoint path and payload shape
- confirm locator visibility before element screenshots
- open Playwright HTML report with `npm run report`
- use Allure report if richer debugging is needed

## 16. Quick Templates

### API test quick template

```ts
import { test, expect, requireAuthToken } from '../fixtures';

test.describe('New API', () => {
  test('happy path -> 200', async ({ apiClient, authState }) => {
    const token = requireAuthToken(authState);

    const response = await apiClient.post(
      '/api/example/path',
      { some_field: 'value' },
      undefined,
      undefined,
      { Authorization: `Bearer ${token}` },
    );

    expect(response.status()).toBe(200);
  });
});
```

### UI / E2E quick template

```ts
import { test, expect } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';

const settings = getSettings();

test('open page', async ({ page }) => {
  test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured');
  await page.goto(String(settings.e2e.baseUrl));
  await expect(page).toHaveURL(/.*/);
});
```

### Visual quick template

```ts
import { test } from './fixtures';
import { expectScreenshot, stabilizePage } from '../../src/tools/visual';

test('page visual', async ({ page, settings }) => {
  if (!settings.e2e.baseUrl) test.skip(true, 'E2E_BASE_URL not configured');

  await page.goto(settings.e2e.baseUrl);
  await stabilizePage(page);

  await expectScreenshot(page, 'page.png', { fullPage: true });
});
```
