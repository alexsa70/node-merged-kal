# Playwright Node.js + TypeScript Project

Node.js `@playwright/test` project migrated from the Python `pytest + Playwright` project in `../playwright-pytest`.

## What Was Migrated

- API test architecture (`APIClient`, route constants, fixtures)
- Auth/login/reset-password/SSO tests
- Organization create tests
- User service tests
- RBAC access matrix tests
- E2E smoke tests with Page Object Model
- `.env`-driven configuration

## Stack

- Node.js + TypeScript
- `@playwright/test`
- `dotenv`
- `otplib` (TOTP support)
- `@faker-js/faker`

## Project Structure

```text
node-playwright/
├── src/
│   ├── clients/
│   │   ├── baseClient.ts
│   │   └── operationsClient.ts
│   ├── config/
│   │   └── settings.ts
│   ├── schema/
│   │   ├── operations.ts
│   │   └── rbac.ts
│   └── tools/
│       ├── assertions/base.ts
│       ├── fakers.ts
│       ├── logger.ts
│       └── routes/
│           ├── auth.ts
│           ├── org.ts
│           ├── users.ts
│           └── index.ts
├── tests/
│   ├── api/
│   │   ├── fixtures.ts
│   │   ├── login/
│   │   ├── org/
│   │   ├── rbac/
│   │   │   └── policy/
│   │   ├── template/
│   │   └── user/
│   └── e2e/
│       ├── components/
│       ├── pages/
│       └── specs/
├── global-setup.ts
├── playwright.config.ts
├── .env.example
└── TestTemplate.md
```

## Setup

```bash
npm install
npx playwright install
cp .env.example .env
```

## Run Tests

```bash
npm test
npm run test:api
npm run test:e2e
npm run test:login
npm run test:rbac
```

## Allure Report

```bash
# Run tests first
npm test
# or
npm run test:api

# Generate Allure report
npm run allure:generate

# Open generated report
npm run allure:open

# Or serve directly from raw results
npm run allure:serve
```

## Authentication Model

- Global auth bootstrap is in `global-setup.ts`.
- It logs in once using `AUTH_CREDENTIALS.*` and stores token in `.auth/default-token.json`.
- All API tests that require auth reuse this one token via `tests/api/fixtures.ts`.
- `/login` tests do not depend on this shared token.
- RBAC tests use dedicated role credentials (`AUTH_CREDENTIALS_SUPER_ADMIN.*`, etc.) and fetch one token per role (worker-scoped fixture).

## Environment Variables

Main required values:

- `API_HTTP_CLIENT.URL`
- `API_HTTP_CLIENT.TIMEOUT`
- `AUTH_CREDENTIALS.EMAIL`
- `AUTH_CREDENTIALS.PASSWORD`

Optional but recommended:

- `AUTH_CREDENTIALS.OTP_SECRET`
- `AUTH_CREDENTIALS_SUPER_ADMIN.*`
- `AUTH_CREDENTIALS_ADMIN.*`
- `AUTH_CREDENTIALS_USER.*`
- `ORG_NAME`, `ORG_ROLE_ID`
- `USER_NAME`, `USER_ID`, `USER_ROLE_ID`, `USER_BASE_URL`
- `E2E_BASE_URL`, `E2E_BROWSER_NAME`, `E2E_HEADLESS`, `E2E_SLOW_MO_MS`, `E2E_DEFAULT_TIMEOUT_MS`

## Notes

- The suite is integration-style and expects a live API.
- Tests skip gracefully when required credentials/variables are missing.
- This migration keeps endpoint coverage and folder conventions aligned with the original Python suite.
