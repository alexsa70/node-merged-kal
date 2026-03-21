# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Node.js + TypeScript Playwright test suite for the Kal-Sense SaaS platform. Covers API, E2E browser, and visual regression tests across multiple environments (qa, prod, on_premise, it).

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
# Fill in .env with credentials and environment URLs
```

## Commands

### Running Tests

```bash
# By project
npm run test:api           # All API tests
npm run test:e2e           # E2E browser tests
npm run test:visual        # Visual regression tests

# Specific test areas
npm run test:login
npm run test:rbac
npm run test:tags
npm run test:files
npm run test:projects
npm run test:general
npm run test:smoke         # API smoke (--grep=smoke)

# Single file or test
npx playwright test tests/api/tags/crud.spec.ts --project=api
npx playwright test tests/api/login --project=api

# Visual snapshots update
npm run test:visual:update

# Type check
npm run typecheck

# CI wrappers (write allure-results, skip Allure/Testmo in CI mode)
npm run ci:api
npm run ci:e2e
npm run ci:visual
```

### Reports

```bash
npm run allure:generate    # Build report from allure-results/
npm run allure:open        # Open generated report
npm run allure:serve       # Serve directly from raw results
npm run report             # Playwright HTML report
```

## Architecture

### Four Playwright Projects (`playwright.config.ts`)

| Project | Tests | Notes |
|---------|-------|-------|
| `api` | `tests/api/**/*.spec.ts` (excl. e2e/) | API-only, no browser |
| `api-e2e` | `tests/api/e2e/**/*.spec.ts` | Authenticated API flows |
| `e2e` | `tests/e2e/**/*.spec.ts` | Browser automation |
| `visual` | `tests/visual/**/*.spec.ts` | Screenshot comparison, Desktop Chrome 1920×1080 |

Global setup (`global-setup.ts`) runs only for `api` and `api-e2e` projects — skipped for e2e/visual.

### Client Hierarchy (`src/clients/`)

```
ApiClient (facade)
  ├── BaseClient        ← HTTP primitives (get/post/patch/delete via PlaywrightHttpClient)
  ├── auth: AuthClient  ← /login, /logout, /reset-password, /sso
  ├── org: OrgClient    ← org management
  ├── user: UserClient  ← user service
  ├── tag: TagClient    ← tag CRUD
  ├── file: FileClient  ← file upload/get/delete
  ├── project: ProjectClient ← project CRUD (resolves productIds/projectTypeIds from envData)
  └── general: GeneralClient ← LLMs, automations, project types, roles
```

All resource client methods are wrapped in `step()` from `src/tools/allure.ts` for Allure reporting.

### Configuration (`src/config/`)

- **`settings.ts`**: Reads `.env` vars → `AppSettings`. Credentials parsed via `readCreds('PREFIX')` which maps `PREFIX.EMAIL`, `PREFIX.PASSWORD`, `PREFIX.OTP_SECRET`.
- **`environments.ts`**: Per-environment static data (API URL, UI URL, orgId, productIds, projectTypeIds, roleIds) for qa/prod/on_premise/it. Accessed via `settings.envData`.

Set `ENVIRONMENT=qa|prod|on_premise|it` to switch environments.

### Fixture Chain (`tests/api/fixtures.ts`)

All API tests import from `tests/api/fixtures.ts`:

- `settings` — `AppSettings` instance
- `apiClient` — `ApiClient` with its own request context
- `authState` — reads `.auth/default-token.json` (written by global setup)
- `authToken` — raw token string (empty string if missing)
- `tokensByRole` — logs in as super_admin/admin/user and returns tokens map (worker-scoped)

Helper functions:
- `requireAuthToken(authState)` — skips test if token unavailable
- `tokenForRoles(tokensByRole, ['admin', 'user'])` — returns first available role token, skips if none

### Tools (`src/tools/`)

- **`allure.ts`**: `step(name, fn)` wrapper, `attachJson(name, data)`, `attachText(name, text)`
- **`visual.ts`**: `expectScreenshot(page, name, opts)`, `expectElementScreenshot(locator, name, opts)`, `stabilizePage(page)` (networkidle + 300ms settle)
- **`routes/`**: Route constants organized by domain — `AuthRoutes`, `OrgRoutes`, `UserRoutes`, `TagRoutes`, `FileRoutes`, `ProjectRoutes`, `GeneralRoutes`; all exported from `index.ts`
- **`fakers.ts`**: Faker helpers for generating test data
- **`logger.ts`**: Structured console logger

### Visual Testing (`tests/visual/`)

- Snapshots committed to git at `tests/visual/snapshots/{testFilePath}/{platform}/{name}.png`
- `tests/visual/fixtures.ts` provides `authedPage` — navigates and logs in via UI credentials
- Consistent environment: UTC timezone, en-US locale, light color scheme, headless, 1920×1080
- Update baseline: `npm run test:visual:update` or commit with `--update-snapshots` (auto-commits in CI)

### RBAC Tests (`tests/api/rbac/`)

- `tests/api/rbac/policy/` — endpoint policy definitions per domain (auth.ts, org.ts, user.ts)
- `tests/api/rbac/access-matrix.spec.ts` — auto-generates tests from policy definitions using `tokensByRole`
- Placeholders like `$USER_ID`, `$ORG_NAME` resolved at runtime from settings

## How to Add a New API Endpoint

1. **Route constant** — add to `src/tools/routes/<domain>.ts`, export from `index.ts`
2. **Client method** — add to `src/clients/resources/<domain>Client.ts`, wrap in `step()`
3. **Register** — add property to `ApiClient` in `src/clients/apiClient.ts`
4. **Zod schema** (optional) — add response types in `src/schema/`
5. **Test** — create `tests/api/<domain>/crud.spec.ts`, import from `../fixtures`
6. **RBAC** (if applicable) — add to `tests/api/rbac/policy/<domain>.ts`

```ts
// Test pattern for protected endpoints
import { test, expect, tokenForRoles } from '../fixtures';

test.describe('MyResource CRUD', () => {
  test.describe.serial('admin flow', () => {
    test('create -> 200', async ({ apiClient, tokensByRole }) => {
      const token = tokenForRoles(tokensByRole, ['admin', 'super_admin']);
      const res = await apiClient.myResource.create({ ... }, token);
      expect(res.status()).toBe(200);
    });
  });
});
```

## CI/CD

### Commit Message Flags

| Flag | Effect |
|------|--------|
| `skip-ci` | Skip all CI |
| `skip-api` | Skip API tests |
| `skip-ui` / `skip-e2e` | Skip E2E tests |
| `skip-visual` | Skip visual tests |
| `run-ci` | Force CI on non-main branches |
| `--testmo` | Submit results to Testmo |
| `--update-snapshots` | Regenerate visual baselines (auto-commits) |
| `--build` | Force Docker image rebuild (Jenkins) |

### Pipelines

- **GitHub Actions** (`.github/workflows/playwright.yml`): lint → API+E2E+visual tests → Allure → GCS → Testmo
- **Jenkins** (`Jenkinsfile`): Docker-based, same stages; `FORCE_BUILD`, `IS_NIGHTLY`, `FORCE_RUN` parameters
- **Script** (`scripts/run-tests.sh`): Wraps playwright test, writes `allure-results/environment.properties`; Allure and Testmo only run locally (not in CI)

### Docker

```dockerfile
# Build image
docker build -t kal-sense-playwright:latest .

# Run tests in container
docker run --env-file .env kal-sense-playwright:latest bash -c "scripts/run-tests.sh --project=api"
```
