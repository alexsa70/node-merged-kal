

Этот документ коротко описывает структуру проекта и даёт шаблоны для добавления новых `API`, `UI/E2E` и `Visual` тестов.

## 1. Как устроен проект

В проекте есть 3 основные зоны тестов:

- `tests/api` - API тесты через Playwright `request`
- `tests/e2e` - UI/E2E тесты в браузере
- `tests/visual` - визуальные тесты со скриншотами

Ключевые файлы:

- `playwright.config.ts` - проекты `api`, `api-e2e`, `e2e`, `visual`
- `global-setup.ts` - общий логин для API тестов
- `src/config/settings.ts` - чтение настроек из `.env`
- `src/clients/` - API клиентский слой
- `src/tools/routes/` - константы роутов
- `src/tools/visual.ts` - helper-ы для visual regression
- `tests/api/fixtures.ts` - API фикстуры, токены, `apiClient`
- `tests/visual/fixtures.ts` - visual фикстуры, `authedPage`
- `tests/e2e/pages/` - page objects

## 2. Какие проекты запускаются

- `api` - все `tests/api/**/*.spec.ts`, кроме `tests/api/e2e`
- `api-e2e` - API flow тесты из `tests/api/e2e`
- `e2e` - UI тесты из `tests/e2e`
- `visual` - визуальные тесты из `tests/visual`

Важно:

- `global-setup.ts` запускается только для `api` и `api-e2e`
- visual проект использует стабильные настройки окружения для скриншотов
- baseline-скриншоты складываются в `tests/visual/snapshots/...`

## 3. Конфиг и авторизация

Основные переменные из `.env`:

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

Как работает авторизация:

- `global-setup.ts` логинится один раз и пишет токен в `.auth/default-token.json`
- API тесты получают его через `authState` или `authToken`
- ролевые API тесты используют `tokensByRole`
- visual тесты логинятся через UI с помощью `authedPage`

## 4. Как добавлять API тест

### Шаг 1. Добавить route

Файл:

- `src/tools/routes/<domain>.ts`

Пример:

```ts
export const BillingRoutes = {
  GET_INVOICE: '/api/billing/get_invoice',
} as const;
```

Если файл новый, экспортируй его из `src/tools/routes/index.ts`.

### Шаг 2. Добавить метод в client

Файл:

- `src/clients/resources/<domain>Client.ts`

Пример:

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

После этого подключи client в `src/clients/apiClient.ts`.

### Шаг 3. Добавить spec

Файл:

- `tests/api/<domain>/<name>.spec.ts`

Пример:

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

### Шаг 4. Выбрать стратегию авторизации

- `requireAuthToken(authState)` - для обычных защищённых endpoint-ов
- без shared token - для `/login` тестов
- `tokenForRoles(tokensByRole, [...])` - для RBAC и ролевых проверок

### Шаг 5. Запустить

```bash
npm run test:api
```

Точечно:

```bash
npx playwright test tests/api/<domain> --project=api
```

## 5. Как добавлять UI / E2E тест

### Шаг 1. Добавить page object

Файл:

- `tests/e2e/pages/<page>Page.ts`

Пример:

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
}
```

### Шаг 2. Добавить spec

Файл:

- `tests/e2e/specs/<name>.spec.ts`

Пример:

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

### Шаг 3. Запустить

```bash
npm run test:e2e
```

Точечно:

```bash
npx playwright test tests/e2e/specs/<name>.spec.ts --project=e2e
```

## 6. Как добавлять Visual тест

Visual тесты используют:

- `tests/visual/fixtures.ts`
- `src/tools/visual.ts`
- `expectScreenshot`
- `expectElementScreenshot`
- `stabilizePage`

### Шаг 1. Добавить spec

Файл:

- `tests/visual/<name>.spec.ts`

Пример:

```ts
import { test } from './fixtures';
import { expectScreenshot, stabilizePage } from '../../src/tools/visual';

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
});
```

### Шаг 2. Первый запуск

Первый запуск создаёт baseline:

```bash
npm run test:visual
```

### Шаг 3. Обновление baseline

Если UI изменился намеренно:

```bash
npm run test:visual:update
```

## 7. Best Practices для этого проекта

Следуй именно этому стилю команды:

- клади тесты по доменам: `tests/api/projects`, `tests/api/files`, `tests/api/login`
- по возможности ходи через resource client, а не через raw `apiClient.post(...)`
- если тесты используют общий созданный объект, включай `serial`
- в CRUD сценариях всегда добавляй cleanup
- для ключевых сценариев помечай тесты тегом `@smoke`
- проверяй не только статус, но и смысловые поля ответа
- для `/login` и похожих auth endpoint-ов не используй shared token
- для ролевых кейсов используй `tokensByRole`, а не вручную собранные токены в spec
- page object должен содержать действия и локаторы, а spec - только сценарий
- visual тесты всегда стабилизируй через `stabilizePage(page)`
- в visual тестах маскируй email, avatar, date/time и другой нестабильный контент
- screenshot names делай стабильными и читаемыми: `settings-page-full.png`, `login-filled.png`
- если тест зависит от env, используй `test.skip(...)` с понятной причиной

## 8. Куда класть новые тесты

- API тесты: `tests/api/<domain>/`
- API flow: `tests/api/e2e/`
- UI/E2E spec: `tests/e2e/specs/`
- page objects: `tests/e2e/pages/`
- Visual тесты: `tests/visual/`

## 9. Команды запуска

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

## 10. Короткие шаблоны

### API

```ts
import { test, expect, requireAuthToken } from '../fixtures';

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
```

### UI / E2E

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

### Visual

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
