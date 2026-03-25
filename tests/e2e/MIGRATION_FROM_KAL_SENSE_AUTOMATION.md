# UI Migration Notes (Kal-Sense-Automation -> node-merged-kal)

## What is already migrated

- `tests/kal_sense/ui_tests/flows/test_login_process.py`
  -> `tests/e2e/specs/login-process.spec.ts`
- `tests/kal_sense/ui_tests/flows/test_sidebar_navigation.py`
  -> `tests/e2e/specs/sidebar-navigation.spec.ts`
- `tests/kal_sense/ui_tests/pages/test_assist_page.py`
  -> `tests/e2e/specs/assist-page.spec.ts`
- `tests/kal_sense/ui_tests/pages/test_audio_page.py`
  -> `tests/e2e/specs/audio-page.spec.ts`
- `tests/kal_sense/ui_tests/pages/test_collections_page.py`
  -> `tests/e2e/specs/collections-page.spec.ts`
- `tests/kal_sense/ui_tests/pages/test_document_page.py`
  -> `tests/e2e/specs/document-page.spec.ts`
- `tests/kal_sense/ui_tests/pages/test_history_page.py`
  -> `tests/e2e/specs/history-page.spec.ts`
- `tests/kal_sense/ui_tests/pages/test_settings_page.py`
  -> `tests/e2e/specs/settings-page.spec.ts`
- `tests/kal_sense/ui_tests/pages/test_tables_page.py`
  -> `tests/e2e/specs/tables-page.spec.ts` (`describe.skip`, same as source)
- Empty source files ported as placeholders:
  - `test_connectors_page.py` -> `tests/e2e/specs/connectors-page.spec.ts`
  - `test_media_page.py` -> `tests/e2e/specs/media-page.spec.ts`
  - `test_organization_page.py` -> `tests/e2e/specs/organization-page.spec.ts`
  - `test_projects_page.py` -> `tests/e2e/specs/projects-page.spec.ts`

## Shared constants added

- `tests/e2e/constants/ui.ts`
  - `UiLocators` mirrors Python locators from `infra/utils/locators.py`
  - `UiEndpoints` mirrors route constants from `infra/data/test_data.py` (`DataCommon`)
- `tests/e2e/helpers/ui.ts`
  - UI helper actions (`selectConnector`, `filterByCurrentDay`, counters, table view)
- `tests/e2e/helpers/api.ts`
  - API setup for UI tests (`createProject`, `uploadFile`, `deleteProject`) using existing TS API clients

## Page objects added

- `tests/e2e/pages/loginPage.ts`
- `tests/e2e/pages/sidebarPage.ts`

These are TypeScript equivalents of:

- `infra/pages/login_page.py`
- `infra/components/sidebar.py`

## Environment mapping

- Python: `.env.credentials` + `get_credentials(...)`
- TypeScript: `.env` + `src/config/settings.ts`
  - regular user: `AUTH_CREDENTIALS_USER.*` (fallback `AUTH_CREDENTIALS.*`)
  - admin user: `AUTH_CREDENTIALS_ADMIN.*`
  - app URL: `E2E_BASE_URL`

Tests skip automatically when required values are missing.

## How to run

```bash
npm run test:e2e
```

Run only migrated specs:

```bash
npx playwright test tests/e2e/specs/login-process.spec.ts --project=e2e
npx playwright test tests/e2e/specs/sidebar-navigation.spec.ts --project=e2e
npx playwright test tests/e2e/specs/*page*.spec.ts --project=e2e
```

## How to migrate the remaining UI tests

1. Move selectors/endpoints into `tests/e2e/constants/ui.ts`.
2. Create/extend page objects in `tests/e2e/pages`.
3. Port test flow into `tests/e2e/specs/*.spec.ts`.
4. Replace pytest fixtures with Playwright fixtures or helper methods.
5. Keep `test.skip(...)` for missing env/credentials.
6.

